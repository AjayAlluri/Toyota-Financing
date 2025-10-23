import { useMemo, useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { useAuth } from './contexts/AuthContext'

type PlanKey = 'Essential' | 'Comfort' | 'Premium'
// Car data interface
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


// Plan dta interface
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
      '/essential.png',
    ],
  },
  Comfort: {
    title: 'Comfort',
    priceRange: '',
    blurb: 'Best value for most drivers.',
    match: 88,
    details: ['Advanced safety', 'Comfort pack', 'Alloy wheels'],
    heroImages: [
      '/comfort.png',
    ],
  },
  Premium: {
    title: 'Premium',
    priceRange: '',
    blurb: 'Top trims and packages.',
    match: 91,
    details: ['Premium audio', 'Leather interior', 'Driver assist+'],
    heroImages: [
      '/premium.png',
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
  const { token } = useAuth()
  const [plans, setPlans] = useState<Record<PlanKey, PlanData>>(defaultPlans)
  const [selected, setSelected] = useState<PlanKey>('Comfort')
  const [mode, setMode] = useState<'finance' | 'lease'>('finance')
  const [showQuestionnaire, setShowQuestionnaire] = useState<boolean>(false)
  const [downPayment, setDownPayment] = useState<number>(5000)
  const [months, setMonths] = useState<number>(36)
   const [leaseMonths, setLeaseMonths] = useState<number>(36)
  const [annualMileage, setAnnualMileage] = useState<number>(12000)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

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
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }
        
        const res = await fetch("http://localhost:3000/api/generate", {
          method: "POST",
          headers,
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
                '/essential.png'
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
                '/comfort.png'
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
                '/premium.png'
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
    if (!currentQuestion) {
      console.log('No current question');
      return false;
    }
    
    // For select and yesno, check if answer is already stored
    if (currentQuestion.type === 'select' || currentQuestion.type === 'yesno') {
      const currentAnswer = answers[currentQuestion.id as keyof typeof answers];
      console.log('Select/YesNo question - current answer:', currentAnswer);
      return currentAnswer !== undefined;
    }
    
    // For number and text, check current input
    switch (currentQuestion.type) {
      case 'number':
        const numberValid = currentInput !== '' && currentInput >= 0;
        console.log('Number question - currentInput:', currentInput, 'valid:', numberValid);
        return numberValid;
      case 'text':
        const textValid = currentInput !== '' && String(currentInput).trim() !== '';
        console.log('Text question - currentInput:', currentInput, 'valid:', textValid);
        return textValid;
      default:
        console.log('Unknown question type:', currentQuestion.type);
        return false;
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white overflow-hidden" style={{ cursor: 'none' }}>
      {/* Custom Cursor with Red Glow */}
      <motion.div
        className="fixed pointer-events-none z-50"
        style={{
          left: mousePosition.x,
          top: mousePosition.y,
        }}
        animate={{
          x: -12,
          y: -12,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 28
        }}
      >
        <div className="relative">
          {/* Trail effect */}
          <div className="absolute inset-0 w-8 h-8 bg-red-500/20 rounded-full blur-lg animate-ping"></div>
          {/* Outer glow */}
          <div className="absolute inset-0 w-6 h-6 bg-red-500/30 rounded-full blur-md animate-pulse"></div>
          {/* Inner glow */}
          <div className="absolute inset-0 w-4 h-4 bg-red-400/50 rounded-full blur-sm"></div>
          {/* Core cursor */}
          <div className="w-3 h-3 bg-red-500 rounded-full shadow-lg shadow-red-500/50"></div>
        </div>
      </motion.div>

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Top accent bars */}
      <div className="h-8 w-full bg-black" />
      <div className="h-1 w-full bg-red-500" />

      {/* Header with dark theme */}
      <header className="w-full backdrop-blur-sm bg-black/20 border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-6 flex items-center justify-between">
          <Link to="/" className="group">
            <motion.div
              className="flex items-center gap-3"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold">
                Toyota <span className="text-red-500">Quote</span>
              </div>
            </motion.div>
          </Link>

          <nav className="flex items-center gap-6">
            <Link
              to="/"
              className="group flex items-center gap-2 px-4 py-2 text-white/90 hover:text-white transition-all duration-200 hover:bg-white/10 rounded-lg"
            >
              <CheckCircle2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Home
            </Link>
            {token ? (
              <Link
                to="/profile"
                className="px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-red-500/25"
              >
                Profile
              </Link>
            ) : (
              <Link
                to="/signin"
                className="px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-red-500/25"
              >
                Sign In
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-6xl px-6 py-8 md:py-12 relative z-10">
        {/* Loading Indicator */}
        {isLoading && (
          <div className="mb-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mb-4"></div>
            <h2 className="text-xl font-semibold text-white">Analyzing Your Financial Profile</h2>
            <p className="text-white/70 mt-2">Finding the best Toyota options for your budget</p>
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
              <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6 md:p-8">
                <p className="text-sm text-white/60 mb-2">Question {currentQuestionIndex + 1} of {questions.length}</p>
                <h2 className="text-xl md:text-2xl font-semibold text-white tracking-tight">
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
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-white placeholder-white/50"
                        onChange={(e) => onInputChange(parseFloat(e.target.value) || '')}
                      />
                      <button
                        type="button"
                        onClick={() => onAnswer(currentInput)}
                        disabled={!canProceed()}
                        className={`px-6 py-2 rounded-lg font-medium transition ${
                          canProceed()
                            ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-red-500/25'
                            : 'bg-white/10 text-white/50 cursor-not-allowed'
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
                              ? 'border-red-500 bg-red-500/20 text-red-400'
                              : 'border-white/20 bg-white/5 hover:border-white/40 text-white'
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
                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white font-medium hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-red-500/25 transition"
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => onAnswer(false)}
                        className="px-4 py-2 rounded-lg bg-white/10 text-white font-medium hover:bg-white/20 transition"
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
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-white placeholder-white/50"
                        onChange={(e) => onInputChange(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => onAnswer(currentInput)}
                        disabled={!canProceed()}
                        className={`px-6 py-2 rounded-lg font-medium transition ${
                          canProceed()
                            ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-red-500/25'
                            : 'bg-white/10 text-white/50 cursor-not-allowed'
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
          <div className="relative inline-flex rounded-xl bg-white/10 border border-white/20 overflow-hidden">
            <button
              type="button"
              aria-pressed={mode === 'lease'}
              onClick={() => setMode('lease')}
              className={[
                'px-4 py-2 text-sm font-medium transition',
                mode === 'lease' ? 'bg-white/20 text-white shadow-inner' : 'text-white/60'
              ].join(' ')}
            >
              Lease
            </button>
            <div className="w-px bg-white/20" />
            <button
              type="button"
              aria-pressed={mode === 'finance'}
              onClick={() => setMode('finance')}
              className={[
                'px-4 py-2 text-sm font-medium transition',
                mode === 'finance' ? 'bg-white/20 text-white shadow-inner' : 'text-white/60'
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
                    'rounded-2xl bg-white/5 backdrop-blur-sm text-left shadow-lg border border-white/10',
                    'p-6 md:p-7 transition will-change-transform',
                    'md:h-[120px]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black',
                    isSelected
                      ? 'scale-[1.02] opacity-100 blur-0 border-t-4 border-red-500'
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
                        <h2 className="text-xl md:text-2xl font-semibold text-white">{plan.title}</h2>
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${
                          key === 'Essential' ? 'bg-blue-500/20 text-blue-400' :
                          key === 'Comfort' ? 'bg-green-500/20 text-green-400' :
                          'bg-purple-500/20 text-purple-400'
                        }`}>
                          {key === 'Essential' ? 'Budget' : key === 'Comfort' ? 'Balanced' : 'Premium'}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-white/70">{plan.blurb}</p>
                    </div>
                    <span className="inline-flex items-center justify-center whitespace-nowrap text-center leading-none text-sm md:text-base font-medium text-white bg-white/10 rounded-full px-3 py-1 border border-white/20 min-w-[120px]">
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
                      className="mt-3 rounded-2xl bg-white/5 backdrop-blur-sm shadow-lg border border-white/10 overflow-hidden md:hidden"
                    >
                      {/* Shared image + meter for both modes */}
                      <div className="relative w-full h-64 bg-white/5 flex items-center justify-center">
                        {plan.heroImages.length > 0 ? (
                          <motion.img
                            src={plan.heroImages[0]}
                            alt={`${plan.title} car`}
                            className="absolute inset-0 w-full h-full object-contain select-none rounded-none"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                          />
                        ) : (
                          <span className="text-sm text-white/50">Image will appear here</span>
                        )}
                      </div>

                      <div className="p-6 space-y-6">
                        {/* Finance/Lease controls (mobile) */}
                        {mode === 'finance' ? (
                          <div className="space-y-5">
                            <div>
                              <div className="flex items-center justify-between">
                                <Label className="text-white">Down Payment</Label>
                                <span className="text-sm text-white">${downPayment.toLocaleString()}</span>
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
                                <Label className="text-white">Term Length</Label>
                                <span className="text-sm text-white">{months} months</span>
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
                                <Label className="text-white">Lease Term</Label>
                                <span className="text-sm text-white">{leaseMonths} months</span>
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
                                <Label className="text-white">Annual Mileage</Label>
                                <span className="text-sm text-white">{annualMileage.toLocaleString()} mi/yr</span>
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
                        
                        <div className="pt-2 flex items-center justify-between border-t border-white/10">
                          <span className="text-base font-semibold text-white">Estimated Monthly</span>
                          <span className="text-2xl font-bold text-red-500">
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
                            <h3 className="text-base font-semibold text-white">Leasing basics</h3>
                            <ul className="grid grid-cols-1 gap-3">
                              {leaseConditions.map((d) => (
                                <li key={d} className="flex items-center gap-2 text-white">
                                  <CheckCircle2 className="h-5 w-5 text-red-500" aria-hidden="true" />
                                  <span className="text-sm">{d}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Specs list */}
                        <ul className="grid grid-cols-1 gap-3">
                          {plan.details.map((d) => (
                            <li key={d} className="flex items-center gap-2 text-white">
                              <CheckCircle2 className="h-5 w-5 text-red-500" aria-hidden="true" />
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
                  'rounded-2xl bg-white/5 backdrop-blur-sm shadow-lg border border-white/10 overflow-hidden',
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
                      <div className="relative w-full h-72 lg:h-96 bg-white/5 flex items-center justify-center">
                        {plan.heroImages.length > 0 ? (
                          <motion.img
                            src={plan.heroImages[0]}
                            alt={`${plan.title} car`}
                            className="absolute inset-0 w-full h-full object-contain select-none"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                          />
                        ) : (
                          <span className="text-sm text-white/50">Image will appear here</span>
                        )}
                      </div>

                      <div className="p-6 md:p-7 space-y-6">
                        {/* Finance/Lease controls (desktop/tablet) */}
                        {mode === 'finance' ? (
                          <div className="space-y-5">
                            <div>
                              <div className="flex items-center justify-between">
                                <Label className="text-white">Down Payment</Label>
                                <span className="text-sm text-white">${downPayment.toLocaleString()}</span>
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
                                <Label className="text-white">Term Length</Label>
                                <span className="text-sm text-white">{months} months</span>
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
                                <Label className="text-white">Lease Term</Label>
                                <span className="text-sm text-white">{leaseMonths} months</span>
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
                                <Label className="text-white">Annual Mileage</Label>
                                <span className="text-sm text-white">{annualMileage.toLocaleString()} mi/yr</span>
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
                        
                        <div className="pt-2 flex items-center justify-between border-t border-white/10">
                          <span className="text-base font-semibold text-white">Estimated Monthly</span>
                          <span className="text-2xl font-bold text-red-500">
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
                            <h3 className="text-base font-semibold text-white">Leasing basics</h3>
                            <ul className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                              {leaseConditions.map((d) => (
                                <li key={d} className="flex items-center gap-2 text-white">
                                  <CheckCircle2 className="h-5 w-5 text-red-500" aria-hidden="true" />
                                  <span className="text-sm md:text-base">{d}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <ul className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                          {plan.details.map((d) => (
                            <li key={d} className="flex items-center gap-2 text-white">
                              <CheckCircle2 className="h-5 w-5 text-red-500" aria-hidden="true" />
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
            onClick={() => {
              if (token) {
                // User is signed in, go to profile to upload documents
                navigate('/profile', { state: { answers, selectedPlan: selected } });
              } else {
                // User is not signed in, redirect to sign in with return path
                navigate('/signin', { 
                  state: { 
                    from: { pathname: '/profile' },
                    message: 'Sign in to save your quote and upload documents',
                    answers,
                    selectedPlan: selected
                  } 
                });
              }
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 px-5 py-2 text-white font-medium hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-red-500/25 transition"
          >
            {token ? 'Upload Documents & Save Quote' : 'Sign In to Save Quote & Upload Documents'}
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
