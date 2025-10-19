import { useMemo, useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'

type PlanKey = 'Essential' | 'Comfort' | 'Premium'

interface CarData {
  year?: number;
  make?: string;
  model?: string;
  trim?: string;
  price?: number;
  mileage?: string;
  seats?: number;
  headline_feature?: string;
  finance?: {
    apr_percent?: number;
    term_months?: number;
    estimated_monthly_payment?: number;
  };
  lease?: {
    term_months?: number;
    estimated_monthly_payment?: number;
    annual_mileage_limit?: number;
    lease_score?: number;
  };
}

interface PlanData {
  title: string;
  priceRange: string;
  blurb: string;
  match: number;
  details: string[];
  heroImages: string[];
  carData?: CarData;
}

const defaultPlans: Record<PlanKey, PlanData> = {
  Essential: {
    title: 'Essential',
    priceRange: '',
    blurb: 'Entry models with essential features.',
    match: 72,
    details: ['Base infotainment', 'Great MPG', 'Low insurance'],
    heroImages: [
      'https://placehold.co/1400x800?text=Toyota+Essential',
    ],
  },
  Comfort: {
    title: 'Comfort',
    priceRange: '',
    blurb: 'Best value for most drivers.',
    match: 88,
    details: ['Advanced safety', 'Comfort pack', 'Alloy wheels'],
    heroImages: [
      'https://placehold.co/1400x800?text=Toyota+Comfort',
    ],
  },
  Premium: {
    title: 'Premium',
    priceRange: '',
    blurb: 'Top trims and packages.',
    match: 91,
    details: ['Premium audio', 'Leather interior', 'Driver assist+'],
    heroImages: [
      'https://placehold.co/1400x800?text=Toyota+Premium',
    ],
  },
}

// Calculate monthly payment using loan formula
function calculateMonthlyPayment(principal: number, annualRate: number, months: number, downPayment: number): number {
  const loanAmount = principal - downPayment;
  if (loanAmount <= 0) return 0;
  const monthlyRate = annualRate / 100 / 12;
  if (monthlyRate === 0) return loanAmount / months;
  return Math.round((loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1));
}

// Calculate adjusted lease payment based on mileage and term
function calculateLeasePayment(basePayment: number, mileage: number, termMonths: number): number {
  if (!basePayment) return 0;
  
  // Base mileage is 12,000 miles/year
  const baseMileage = 12000;
  
  // Mileage adjustment: +3% per 2,500 miles over base
  const mileageOverBase = Math.max(0, mileage - baseMileage);
  const mileageMultiplier = 1 + (mileageOverBase / 2500) * 0.03;
  
  // Term adjustment: base is 36 months
  // Shorter terms (24, 30): slightly lower rate (-1.5% per 6 months under)
  // Longer terms (42, 48): slightly higher rate (+1% per 6 months over)
  const baseTerm = 36;
  const termDifference = termMonths - baseTerm;
  const termAdjustment = termDifference < 0 
    ? (termDifference / 6) * 0.015  // Negative, so this reduces the cost
    : (termDifference / 6) * 0.01;  // Positive, so this increases the cost
  const termMultiplier = 1 + termAdjustment;
  
  // Apply both adjustments
  const adjustedPayment = basePayment * mileageMultiplier * termMultiplier;
  
  return Math.round(adjustedPayment);
}

function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const [plans, setPlans] = useState<Record<PlanKey, PlanData>>(defaultPlans)
  const [selected, setSelected] = useState<PlanKey>('Comfort')
  const [mode, setMode] = useState<'finance' | 'lease'>('finance')
  const [showQuestionnaire, setShowQuestionnaire] = useState<boolean>(false)
  const [downPayment, setDownPayment] = useState<number>(5000)
  const [months, setMonths] = useState<number>(36)
   const [leaseMonths, setLeaseMonths] = useState<number>(36)
  const [annualMileage, setAnnualMileage] = useState<number>(12000)
  const entries = useMemo(() => Object.entries(plans) as [PlanKey, PlanData][], [plans])
  const [imageIndexByPlan, setImageIndexByPlan] = useState<Record<PlanKey, number>>({ Essential: 0, Comfort: 0, Premium: 0 })
  const setImageIndex = (planKey: PlanKey, idx: number) => setImageIndexByPlan((prev) => ({ ...prev, [planKey]: idx }))
  const goPrev = (planKey: PlanKey) => {
    const images = plans[planKey].heroImages
    const current = imageIndexByPlan[planKey] ?? 0
    const next = (current - 1 + images.length) % images.length
    setImageIndex(planKey, next)
  }
  const goNext = (planKey: PlanKey) => {
    const images = plans[planKey].heroImages
    const current = imageIndexByPlan[planKey] ?? 0
    const next = (current + 1) % images.length
    setImageIndex(planKey, next)
  }

  const leaseConditions = useMemo(
    () => [
      'Lower monthly payment vs financing',
      'Typical term: 24–36 months',
      'Mileage limits (e.g., 10k–12k/year)',
      'Excess wear & tear charges may apply',
      'Disposition fee at lease end',
      'Option to buy at preset residual value',
      'Good credit and upfront fees required',
    ],
    []
  )

  // Define question types and their configurations
  type QuestionType = 'number' | 'select' | 'text' | 'yesno'
  
  interface Question {
    id: string
    text: string
    type: QuestionType
    placeholder?: string
    options?: string[]
    min?: number
    max?: number
    step?: number
  }

  const questions: Question[] = [
    {
      id: 'gross_monthly_income',
      text: 'What is your gross monthly income (before taxes)?',
      type: 'number',
      placeholder: 'Enter amount in USD',
      min: 0,
      step: 100
    },
    {
      id: 'other_monthly_income',
      text: 'What is your other reliable monthly income?',
      type: 'number',
      placeholder: 'Enter amount in USD (0 if none)',
      min: 0,
      step: 100
    },
    {
      id: 'fixed_monthly_expenses',
      text: 'What are your total monthly fixed expenses?',
      type: 'number',
      placeholder: 'Enter amount in USD',
      min: 0,
      step: 100
    },
    {
      id: 'liquid_savings',
      text: 'How much liquid savings do you currently have?',
      type: 'number',
      placeholder: 'Enter amount in USD',
      min: 0,
      step: 1000
    },
    {
      id: 'credit_score',
      text: 'What is your current credit score?',
      type: 'select',
      options: ['300-579 (Poor)', '580-669 (Fair)', '670-739 (Good)', '740-799 (Very Good)', '800-850 (Excellent)', 'I don\'t know']
    },
    {
      id: 'ownership_horizon',
      text: 'How long do you plan to keep your next vehicle?',
      type: 'select',
      options: ['1-2 years', '3-4 years', '5-6 years', '7+ years', 'I\'m not sure']
    },
    {
      id: 'annual_mileage',
      text: 'How many miles do you typically drive per year?',
      type: 'select',
      options: ['Under 10,000', '10,000-15,000', '15,000-20,000', '20,000-25,000', 'Over 25,000']
    },
    {
      id: 'passenger_needs',
      text: 'What are your passenger or cargo needs?',
      type: 'select',
      options: ['Just me', '2-3 people', '4-5 people', '6+ people', 'Need cargo space', 'Need towing capacity']
    },
    {
      id: 'commute_profile',
      text: 'How would you describe your driving or commute profile?',
      type: 'select',
      options: ['City driving', 'Highway driving', 'Mixed city/highway', 'Mostly short trips', 'Long road trips']
    },
    {
      id: 'down_payment',
      text: 'How much do you plan to put down as a down payment?',
      type: 'number',
      placeholder: 'Enter amount in USD',
      min: 0,
      step: 500
    }
  ]

  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [currentInput, setCurrentInput] = useState<any>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const currentQuestionIndex = Object.keys(answers).length
  const currentQuestion = questions[currentQuestionIndex]
  
  const onAnswer = (value: any) => {
    if (currentQuestion) {
      setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }))
      setCurrentInput('') // Reset input for next question
    }
  }

  useEffect(() => {
    if (Object.keys(answers).length == questions.length) {
      const sendAnswers = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("http://localhost:3000/api/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(answers),
        });

        if (!res.ok) {
          throw new Error(`HTTP error: ${res.status}`);
        }

        const data = await res.json();
        console.log("=== AI Response Received ===");
        console.log(JSON.stringify(data, null, 2));
        
        // Update plans with AI data
        if (data.Budget && data.Balanced && data.Premium) {
          setPlans({
            Essential: {
              title: 'Essential',
              priceRange: data.Budget.price ? `$${data.Budget.price.toLocaleString()}` : '',
              blurb: `${data.Budget.year} ${data.Budget.model} ${data.Budget.trim}`,
              match: 72,
              details: [
                data.Budget.headline_feature || 'Base features',
                data.Budget.mileage || 'Great MPG',
                `${data.Budget.seats || 5} seats`
              ],
              heroImages: [
                `https://placehold.co/1400x800?text=${encodeURIComponent(data.Budget.model)}`,
                `https://placehold.co/1400x800?text=${encodeURIComponent(data.Budget.model)}+2`,
                `https://placehold.co/1400x800?text=${encodeURIComponent(data.Budget.model)}+3`
              ],
              carData: data.Budget
            },
            Comfort: {
              title: 'Comfort',
              priceRange: data.Balanced.price ? `$${data.Balanced.price.toLocaleString()}` : '',
              blurb: `${data.Balanced.year} ${data.Balanced.model} ${data.Balanced.trim}`,
              match: 88,
              details: [
                data.Balanced.headline_feature || 'Balanced features',
                data.Balanced.mileage || 'Great MPG',
                `${data.Balanced.seats || 5} seats`
              ],
              heroImages: [
                `https://placehold.co/1400x800?text=${encodeURIComponent(data.Balanced.model)}`,
                `https://placehold.co/1400x800?text=${encodeURIComponent(data.Balanced.model)}+2`,
                `https://placehold.co/1400x800?text=${encodeURIComponent(data.Balanced.model)}+3`
              ],
              carData: data.Balanced
            },
            Premium: {
              title: 'Premium',
              priceRange: data.Premium.price ? `$${data.Premium.price.toLocaleString()}` : '',
              blurb: `${data.Premium.year} ${data.Premium.model} ${data.Premium.trim}`,
              match: 91,
              details: [
                data.Premium.headline_feature || 'Premium features',
                data.Premium.mileage || 'Great MPG',
                `${data.Premium.seats || 5} seats`
              ],
              heroImages: [
                `https://placehold.co/1400x800?text=${encodeURIComponent(data.Premium.model)}`,
                `https://placehold.co/1400x800?text=${encodeURIComponent(data.Premium.model)}+2`,
                `https://placehold.co/1400x800?text=${encodeURIComponent(data.Premium.model)}+3`
              ],
              carData: data.Premium
            }
          });
          
          // Close questionnaire to show results
          setShowQuestionnaire(false);
        }
      } catch (err) {
        console.error("Error sending answers:", err);
      } finally {
        setIsLoading(false);
      }
    };

    sendAnswers();

    }
  }, [answers, questions.length])

  const onInputChange = (value: any) => {
    setCurrentInput(value)
  }


  // Reset current input when question changes
  useEffect(() => {
    setCurrentInput('')
  }, [currentQuestionIndex])

  const canProceed = () => {
    if (!currentQuestion) return false
    
    // For select and yesno, check if answer is already stored
    if (currentQuestion.type === 'select' || currentQuestion.type === 'yesno') {
      const currentAnswer = answers[currentQuestion.id as keyof typeof answers]
      return currentAnswer !== undefined
    }
    
    // For number and text, check current input
    switch (currentQuestion.type) {
      case 'number':
        return currentInput !== '' && currentInput >= 0
      case 'text':
        return currentInput !== '' && String(currentInput).trim() !== ''
      default:
        return false
    }
  }
  
  const questionnaireDone = currentQuestionIndex >= questions.length

  // If route was navigated to with startQuiz flag, open questionnaire immediately
  if (!showQuestionnaire && (location.state as any)?.startQuiz) {
    setShowQuestionnaire(true)
    // clear the flag so back/forward doesn't re-trigger
    ;(location.state as any).startQuiz = false
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans">
      {/* Top accent bars */}
      <div className="h-8 w-full bg-black" />
      <div className="h-1 w-full bg-[#EB0A1E]" />

      {/* Header aligned to landing: brand left, actions right */}
      <header className="bg-white/90 backdrop-blur border-b border-gray-200">
        <div className="mx-auto max-w-6xl px-6 py-4 md:py-6">
          <div className="flex items-start justify-between">
            <div className="leading-tight">
              <Link to="/" className="text-2xl md:text-4xl font-semibold tracking-tight text-[#111111] hover:opacity-90 transition-opacity">
                Toyota <span className="text-[#EB0A1E]">Quote</span>
              </Link>
            </div>
            <nav className="flex items-center gap-4 md:gap-6">
              <Link
                to="/"
                className="px-4 py-2 text-base font-medium rounded bg-[#111111] text-white hover:opacity-90 focus:opacity-90 transition-opacity duration-200"
              >
                Home
              </Link>
              <Link
                to="/signin"
                className="px-4 py-2 text-base font-medium rounded bg-white text-[#111111] border border-gray-300 hover:bg-gray-50 transition-colors duration-200"
              >
                Sign Up / Sign In
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-6xl px-6 py-8 md:py-12">
        {/* Loading Indicator */}
        {isLoading && (
          <div className="mb-8 rounded-2xl bg-white shadow-lg border border-gray-200 p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#EB0A1E] mb-4"></div>
            <h2 className="text-xl font-semibold text-[#111111]">Analyzing Your Financial Profile</h2>
            <p className="text-gray-600 mt-2">Finding the best Toyota options for your budget</p>
          </div>
        )}
        
        <AnimatePresence mode="wait">
          {showQuestionnaire && !questionnaireDone ? (
            <motion.section
              key="questionnaire"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="mx-auto max-w-2xl"
            >
              <div className="rounded-2xl bg-white shadow-lg border border-gray-200 p-6 md:p-8">
                <p className="text-sm text-[#6b7280] mb-2">Question {currentQuestionIndex + 1} of {questions.length}</p>
                <h2 className="text-xl md:text-2xl font-semibold text-[#111111] tracking-tight">
                  {currentQuestion?.text}
                </h2>
                

                <div className="mt-6">
                  {currentQuestion?.type === 'number' && (
                    <div className="space-y-4">
                      <input
                        type="number"
                        placeholder={currentQuestion.placeholder}
                        min={currentQuestion.min}
                        max={currentQuestion.max}
                        step={currentQuestion.step}
                        value={currentInput}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EB0A1E] focus:border-transparent outline-none"
                        onChange={(e) => onInputChange(parseFloat(e.target.value) || '')}
                      />
                      <button
                        type="button"
                        onClick={() => onAnswer(currentInput)}
                        disabled={!canProceed()}
                        className={`px-6 py-2 rounded-lg font-medium transition ${
                          canProceed()
                            ? 'bg-[#EB0A1E] text-white hover:opacity-90'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        Continue
                      </button>
                    </div>
                  )}
                  
                  {currentQuestion?.type === 'select' && (
                    <div className="space-y-3">
                      {currentQuestion.options?.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => onAnswer(option)}
                          className={`w-full text-left px-4 py-3 rounded-lg border transition ${
                            answers[currentQuestion.id as keyof typeof answers] === option
                              ? 'border-[#EB0A1E] bg-red-50 text-[#EB0A1E]'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {currentQuestion?.type === 'yesno' && (
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => onAnswer(true)}
                        className="px-4 py-2 rounded-lg bg-[#EB0A1E] text-white font-medium hover:opacity-90 transition"
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => onAnswer(false)}
                        className="px-4 py-2 rounded-lg bg-gray-900 text-white font-medium hover:opacity-90 transition"
                      >
                        No
                      </button>
                    </div>
                  )}
                  
                  {currentQuestion?.type === 'text' && (
                    <div className="space-y-4">
                      <input
                        type="text"
                        placeholder={currentQuestion.placeholder}
                        value={currentInput}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EB0A1E] focus:border-transparent outline-none"
                        onChange={(e) => onInputChange(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => onAnswer(currentInput)}
                        disabled={!canProceed()}
                        className={`px-6 py-2 rounded-lg font-medium transition ${
                          canProceed()
                            ? 'bg-[#EB0A1E] text-white hover:opacity-90'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        Continue
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.section>
          ) : (
            <motion.div
              key="carrec-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            >
        {/* Global Lease/Finance toggle */}
        <div className="mb-6 md:mb-8 flex justify-start">
          <div className="relative inline-flex rounded-xl bg-gray-100 border border-gray-200 overflow-hidden">
            <button
              type="button"
              aria-pressed={mode === 'lease'}
              onClick={() => setMode('lease')}
              className={[
                'px-4 py-2 text-sm font-medium transition',
                mode === 'lease' ? 'bg-white text-[#111111] shadow-inner' : 'text-[#6b7280]'
              ].join(' ')}
            >
              Lease
            </button>
            <div className="w-px bg-gray-300" />
            <button
              type="button"
              aria-pressed={mode === 'finance'}
              onClick={() => setMode('finance')}
              className={[
                'px-4 py-2 text-sm font-medium transition',
                mode === 'finance' ? 'bg-white text-[#111111] shadow-inner' : 'text-[#6b7280]'
              ].join(' ')}
            >
              Finance
            </button>
          </div>
        </div>

        <div
          role="radiogroup"
          aria-label="Select a plan"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8"
        >
          {entries.map(([key, plan]) => {
            const isSelected = key === selected
            return (
              <div key={key} className="flex flex-col md:row-start-1">
                <motion.button
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => setSelected(key)}
                  className={[
                    'rounded-2xl bg-white text-left shadow-lg border border-gray-200',
                    'p-6 md:p-7 transition will-change-transform',
                    'md:h-[120px]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EB0A1E] focus-visible:ring-offset-2 focus-visible:ring-offset-white',
                    isSelected
                      ? 'scale-[1.02] opacity-100 blur-0 border-t-4 border-[#EB0A1E]'
                      : 'opacity-70 blur-[2px]'
                  ].join(' ')}
                  whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.08)' }}
                  whileTap={{ scale: 0.99 }}
                  animate={{ scale: isSelected ? 1.02 : 1, opacity: isSelected ? 1 : 0.7 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-xl md:text-2xl font-semibold text-[#111111]">{plan.title}</h2>
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${
                          key === 'Essential' ? 'bg-blue-100 text-blue-700' :
                          key === 'Comfort' ? 'bg-green-100 text-green-700' :
                          'bg-purple-100 text-purple-700'
                        }`}>
                          {key === 'Essential' ? 'Budget' : key === 'Comfort' ? 'Balanced' : 'Premium'}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-[#9CA3AF]">{plan.blurb}</p>
                    </div>
                    <span className="inline-flex items-center justify-center whitespace-nowrap text-center leading-none text-sm md:text-base font-medium text-[#111111] bg-gray-100 rounded-full px-3 py-1 border border-gray-200 min-w-[120px]">
                      {plan.priceRange || 'Price TBD'}
                    </span>
                  </div>
                </motion.button>
                {/* Mobile: show details directly under the card */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      key={`${key}-details-mobile`}
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ type: 'spring', stiffness: 280, damping: 28 }}
                      className="mt-3 rounded-2xl bg-white shadow-lg border border-gray-200 overflow-hidden md:hidden"
                    >
                      {/* Shared image + meter for both modes */}
                      <div className="relative w-full h-64 bg-gray-100 flex items-center justify-center">
                        {plan.heroImages.length > 0 ? (
                          <>
                            <AnimatePresence mode="wait">
                              <motion.img
                                key={plan.heroImages[imageIndexByPlan[key] ?? 0]}
                                src={plan.heroImages[imageIndexByPlan[key] ?? 0]}
                                alt={`${plan.title} car`}
                                className="absolute inset-0 w-full h-full object-cover select-none rounded-none"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.35, ease: 'easeOut' }}
                              />
                            </AnimatePresence>
                            <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-2">
                              <button
                                type="button"
                                aria-label="Previous image"
                                onClick={() => goPrev(key)}
                                className="pointer-events-auto inline-flex items-center justify-center h-8 w-8 rounded-full bg-white/60 hover:bg-white/80 text-[#111111] shadow border border-gray-200 backdrop-blur"
                              >
                                <ChevronLeft className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                aria-label="Next image"
                                onClick={() => goNext(key)}
                                className="pointer-events-auto inline-flex items-center justify-center h-8 w-8 rounded-full bg-white/60 hover:bg-white/80 text-[#111111] shadow border border-gray-200 backdrop-blur"
                              >
                                <ChevronRight className="h-4 w-4" />
                              </button>
                            </div>
                          </>
                        ) : (
                          <span className="text-sm text-gray-500">Image will appear here</span>
                        )}
                      </div>

                      <div className="p-6 space-y-6">
                        {/* Finance/Lease controls (mobile) */}
                        {mode === 'finance' ? (
                          <div className="space-y-5">
                            <div>
                              <div className="flex items-center justify-between">
                                <Label className="text-[#111111]">Down Payment</Label>
                                <span className="text-sm text-[#111111]">${downPayment.toLocaleString()}</span>
                              </div>
                              <div className="mt-2">
                                <Slider
                                  defaultValue={[downPayment]}
                                  value={[downPayment]}
                                  onValueChange={(v) => setDownPayment(v[0])}
                                  min={0}
                                  max={20000}
                                  step={500}
                                  className="w-full"
                                  showTooltip
                                  tooltipContent={(v) => `$${v.toLocaleString()}`}
                                />
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center justify-between">
                                <Label className="text-[#111111]">Term Length</Label>
                                <span className="text-sm text-[#111111]">{months} months</span>
                              </div>
                              <div className="mt-2">
                                <Slider
                                  defaultValue={[months]}
                                  value={[months]}
                                  onValueChange={(v) => setMonths(v[0])}
                                  min={12}
                                  max={72}
                                  step={6}
                                  className="w-full"
                                  showTooltip
                                  tooltipContent={(v) => `${v} mo`}
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-5">
                            <div>
                              <div className="flex items-center justify-between">
                                <Label className="text-[#111111]">Lease Term</Label>
                                <span className="text-sm text-[#111111]">{leaseMonths} months</span>
                              </div>
                              <div className="mt-2">
                                <Slider
                                  defaultValue={[leaseMonths]}
                                  value={[leaseMonths]}
                                  onValueChange={(v) => setLeaseMonths(v[0])}
                                  min={24}
                                  max={48}
                                  step={6}
                                  className="w-full"
                                  showTooltip
                                  tooltipContent={(v) => `${v} mo`}
                                />
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center justify-between">
                                <Label className="text-[#111111]">Annual Mileage</Label>
                                <span className="text-sm text-[#111111]">{annualMileage.toLocaleString()} mi/yr</span>
                              </div>
                              <div className="mt-2">
                                <Slider
                                  defaultValue={[annualMileage]}
                                  value={[annualMileage]}
                                  onValueChange={(v) => setAnnualMileage(v[0])}
                                  min={7500}
                                  max={20000}
                                  step={2500}
                                  className="w-full"
                                  showTooltip
                                  tooltipContent={(v) => `${v.toLocaleString()} mi`}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div className="pt-2 flex items-center justify-between border-t border-gray-200">
                          <span className="text-base font-semibold text-[#111111]">Estimated Monthly</span>
                          <span className="text-2xl font-bold text-[#EB0A1E]">
                            {(() => {
                              if (mode === 'finance' && plan.carData?.price && plan.carData?.finance?.apr_percent) {
                                const payment = calculateMonthlyPayment(
                                  plan.carData.price,
                                  plan.carData.finance.apr_percent,
                                  months,
                                  downPayment
                                );
                                return `$${payment.toLocaleString()}/mo`;
                              } else if (mode === 'lease' && plan.carData?.lease?.estimated_monthly_payment) {
                                const payment = calculateLeasePayment(
                                  plan.carData.lease.estimated_monthly_payment,
                                  annualMileage,
                                  leaseMonths
                                );
                                return `$${payment.toLocaleString()}/mo`;
                              }
                              return '$—/mo';
                            })()}
                          </span>
                        </div>

                        {mode === 'lease' && (
                          <div className="space-y-3">
                            <h3 className="text-base font-semibold text-[#111111]">Leasing basics</h3>
                            <ul className="grid grid-cols-1 gap-3">
                              {leaseConditions.map((d) => (
                                <li key={d} className="flex items-center gap-2 text-[#111111]">
                                  <CheckCircle2 className="h-5 w-5 text-[#EB0A1E]" aria-hidden="true" />
                                  <span className="text-sm">{d}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Specs list */}
                        <ul className="grid grid-cols-1 gap-3">
                          {plan.details.map((d) => (
                            <li key={d} className="flex items-center gap-2 text-[#111111]">
                              <CheckCircle2 className="h-5 w-5 text-[#EB0A1E]" aria-hidden="true" />
                              <span className="text-sm md:text-base">{d}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}

          {/* Desktop/Tablet: one details panel that starts under the selected card and stretches to the right edge */}
          <AnimatePresence mode="wait">
            {selected && (
              <motion.div
                key={`desktop-details-${selected}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ type: 'spring', stiffness: 280, damping: 28 }}
                className={[
                  'hidden md:block',
                  'rounded-2xl bg-white shadow-lg border border-gray-200 overflow-hidden',
                  'md:col-start-1 md:col-end-4 md:row-start-2',
                  // visually attach to the card above
                  'md:mt-3'
                ].join(' ')}
              >
                {(() => {
                  const plan = plans[selected]
                  return (
                    <div className="w-full">
                      {/* Shared image + meter for both modes */}
                      <div className="relative w-full h-72 lg:h-96 bg-gray-100 flex items-center justify-center">
                        {plan.heroImages.length > 0 ? (
                          <>
                            <AnimatePresence mode="wait">
                              <motion.img
                                key={plan.heroImages[imageIndexByPlan[selected] ?? 0]}
                                src={plan.heroImages[imageIndexByPlan[selected] ?? 0]}
                                alt={`${plan.title} car`}
                                className="absolute inset-0 w-full h-full object-cover select-none"
                                initial={{ opacity: 0, x: 24 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -24 }}
                                transition={{ duration: 0.4, ease: 'easeOut' }}
                              />
                            </AnimatePresence>
                            <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-3">
                              <button
                                type="button"
                                aria-label="Previous image"
                                onClick={() => goPrev(selected)}
                                className="pointer-events-auto inline-flex items-center justify-center h-9 w-9 rounded-full bg-white/60 hover:bg-white/80 text-[#111111] shadow border border-gray-200 backdrop-blur"
                              >
                                <ChevronLeft className="h-5 w-5" />
                              </button>
                              <button
                                type="button"
                                aria-label="Next image"
                                onClick={() => goNext(selected)}
                                className="pointer-events-auto inline-flex items-center justify-center h-9 w-9 rounded-full bg-white/60 hover:bg-white/80 text-[#111111] shadow border border-gray-200 backdrop-blur"
                              >
                                <ChevronRight className="h-5 w-5" />
                              </button>
                            </div>
                          </>
                        ) : (
                          <span className="text-sm text-gray-500">Image will appear here</span>
                        )}
                      </div>

                      <div className="p-6 md:p-7 space-y-6">
                        {/* Finance/Lease controls (desktop/tablet) */}
                        {mode === 'finance' ? (
                          <div className="space-y-5">
                            <div>
                              <div className="flex items-center justify-between">
                                <Label className="text-[#111111]">Down Payment</Label>
                                <span className="text-sm text-[#111111]">${downPayment.toLocaleString()}</span>
                              </div>
                              <div className="mt-2">
                                <Slider
                                  defaultValue={[downPayment]}
                                  value={[downPayment]}
                                  onValueChange={(v) => setDownPayment(v[0])}
                                  min={0}
                                  max={20000}
                                  step={500}
                                  className="w-full"
                                  showTooltip
                                  tooltipContent={(v) => `$${v.toLocaleString()}`}
                                />
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center justify-between">
                                <Label className="text-[#111111]">Term Length</Label>
                                <span className="text-sm text-[#111111]">{months} months</span>
                              </div>
                              <div className="mt-2">
                                <Slider
                                  defaultValue={[months]}
                                  value={[months]}
                                  onValueChange={(v) => setMonths(v[0])}
                                  min={12}
                                  max={72}
                                  step={6}
                                  className="w-full"
                                  showTooltip
                                  tooltipContent={(v) => `${v} mo`}
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-5">
                            <div>
                              <div className="flex items-center justify-between">
                                <Label className="text-[#111111]">Lease Term</Label>
                                <span className="text-sm text-[#111111]">{leaseMonths} months</span>
                              </div>
                              <div className="mt-2">
                                <Slider
                                  defaultValue={[leaseMonths]}
                                  value={[leaseMonths]}
                                  onValueChange={(v) => setLeaseMonths(v[0])}
                                  min={24}
                                  max={48}
                                  step={6}
                                  className="w-full"
                                  showTooltip
                                  tooltipContent={(v) => `${v} mo`}
                                />
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center justify-between">
                                <Label className="text-[#111111]">Annual Mileage</Label>
                                <span className="text-sm text-[#111111]">{annualMileage.toLocaleString()} mi/yr</span>
                              </div>
                              <div className="mt-2">
                                <Slider
                                  defaultValue={[annualMileage]}
                                  value={[annualMileage]}
                                  onValueChange={(v) => setAnnualMileage(v[0])}
                                  min={7500}
                                  max={20000}
                                  step={2500}
                                  className="w-full"
                                  showTooltip
                                  tooltipContent={(v) => `${v.toLocaleString()} mi`}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div className="pt-2 flex items-center justify-between border-t border-gray-200">
                          <span className="text-base font-semibold text-[#111111]">Estimated Monthly</span>
                          <span className="text-2xl font-bold text-[#EB0A1E]">
                            {(() => {
                              if (mode === 'finance' && plan.carData?.price && plan.carData?.finance?.apr_percent) {
                                const payment = calculateMonthlyPayment(
                                  plan.carData.price,
                                  plan.carData.finance.apr_percent,
                                  months,
                                  downPayment
                                );
                                return `$${payment.toLocaleString()}/mo`;
                              } else if (mode === 'lease' && plan.carData?.lease?.estimated_monthly_payment) {
                                const payment = calculateLeasePayment(
                                  plan.carData.lease.estimated_monthly_payment,
                                  annualMileage,
                                  leaseMonths
                                );
                                return `$${payment.toLocaleString()}/mo`;
                              }
                              return '$—/mo';
                            })()}
                          </span>
                        </div>

                        {mode === 'lease' && (
                          <div className="space-y-3">
                            <h3 className="text-base font-semibold text-[#111111]">Leasing basics</h3>
                            <ul className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                              {leaseConditions.map((d) => (
                                <li key={d} className="flex items-center gap-2 text-[#111111]">
                                  <CheckCircle2 className="h-5 w-5 text-[#EB0A1E]" aria-hidden="true" />
                                  <span className="text-sm md:text-base">{d}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <ul className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                          {plan.details.map((d) => (
                            <li key={d} className="flex items-center gap-2 text-[#111111]">
                              <CheckCircle2 className="h-5 w-5 text-[#EB0A1E]" aria-hidden="true" />
                              <span className="text-sm md:text-base">{d}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )
                })()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Next step button */}
        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={() => navigate('/upload', { state: { answers, selectedPlan: selected } })}
            className="inline-flex items-center gap-2 rounded-lg bg-[#EB0A1E] px-5 py-2 text-white font-medium hover:opacity-90 focus:opacity-90 transition"
          >
            Let's take it to the next step
          </button>
        </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

export default App
