import { useMemo, useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuth } from './contexts/AuthContext'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'

type PlanKey = 'Essential' | 'Comfort' | 'Premium'

const plans: Record<PlanKey, {
  title: string;
  priceRange: string;
  blurb: string;
  match: number;        // 0–100
  details: string[];
  heroImages: string[];    // multiple images per plan (filled by API later)
}> = {
  Essential: {
    title: 'Essential',
    priceRange: '',
    blurb: 'Entry models with essential features.',
    match: 72,
    details: ['Base infotainment', 'Great MPG', 'Low insurance'],
    heroImages: [
      'https://placehold.co/1400x800?text=Car+Image+1',
      'https://placehold.co/1400x800?text=Car+Image+2',
      'https://placehold.co/1400x800?text=Car+Image+3'
    ],
  },
  Comfort: {
    title: 'Comfort',
    priceRange: '',
    blurb: 'Best value for most drivers.',
    match: 88,
    details: ['Advanced safety', 'Comfort pack', 'Alloy wheels'],
    heroImages: [
      'https://placehold.co/1400x800?text=Car+Image+1',
      'https://placehold.co/1400x800?text=Car+Image+2',
      'https://placehold.co/1400x800?text=Car+Image+3'
    ],
  },
  Premium: {
    title: 'Premium',
    priceRange: '',
    blurb: 'Top trims and packages.',
    match: 91,
    details: ['Premium audio', 'Leather interior', 'Driver assist+'],
    heroImages: [
      'https://placehold.co/1400x800?text=Car+Image+1',
      'https://placehold.co/1400x800?text=Car+Image+2',
      'https://placehold.co/1400x800?text=Car+Image+3'
    ],
  },
}

function App() {
  const location = useLocation()
  const { user, signOut } = useAuth()
  const [selected, setSelected] = useState<PlanKey>('Comfort')
  const [mode, setMode] = useState<'finance' | 'lease'>('finance')
  const [showQuestionnaire, setShowQuestionnaire] = useState<boolean>(false)
  // moved state declaration to avoid redeclaration error
  // (remove this line and use only the declaration in src/App.tsx near the questionnaire use)
  const [downPayment, setDownPayment] = useState<number>(5000)
  const [months, setMonths] = useState<number>(36)
  const entries = useMemo(() => Object.entries(plans) as [PlanKey, typeof plans[PlanKey]][], [])
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
      id: 'income',
      text: 'What is your gross monthly income (before taxes)?',
      type: 'number',
      placeholder: 'Enter amount in USD',
      min: 0,
      step: 100
    },
    {
      id: 'other_income',
      text: 'What is your other reliable monthly income?',
      type: 'number',
      placeholder: 'Enter amount in USD (0 if none)',
      min: 0,
      step: 100
    },
    {
      id: 'expenses',
      text: 'What are your total monthly fixed expenses?',
      type: 'number',
      placeholder: 'Enter amount in USD',
      min: 0,
      step: 100
    },
    {
      id: 'savings',
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
      id: 'vehicle_ownership',
      text: 'How long do you plan to keep your next vehicle?',
      type: 'select',
      options: ['1-2 years', '3-4 years', '5-6 years', '7+ years', 'I\'m not sure']
    },
    {
      id: 'annual_miles',
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
      id: 'driving_profile',
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
  const currentQuestionIndex = Object.keys(answers).length
  const currentQuestion = questions[currentQuestionIndex]
  
  const onAnswer = (value: any) => {
    if (currentQuestion) {
      setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }))
      setCurrentInput('') // Reset input for next question
    }
  }

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
              <Link to="/" className="text-2xl md:text-3xl font-semibold tracking-tight text-[#111111] hover:opacity-90 transition-opacity">
                Toyota <span className="text-[#EB0A1E]">Quote</span>
              </Link>
            </div>
            <nav className="flex items-center gap-3">
              <Link
                to="/"
                className="px-3 py-1.5 text-sm font-medium rounded bg-[#111111] text-white hover:opacity-90 focus:opacity-90 transition-opacity duration-200"
              >
                Home
              </Link>
              {user ? (
                <>
                  <Link
                    to={user.role === 'sales' ? '/dealer' : '/profile'}
                    className="px-3 py-1.5 text-sm font-medium rounded bg-white text-[#111111] border border-gray-300 hover:bg-gray-50 transition-colors duration-200"
                  >
                    {user.role === 'sales' ? 'Sales Portal' : 'Profile'}
                  </Link>
                  <button
                    onClick={signOut}
                    className="px-3 py-1.5 text-sm font-medium rounded bg-gray-100 text-[#111111] hover:bg-gray-200 transition-colors duration-200"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  to="/signin"
                  className="px-3 py-1.5 text-sm font-medium rounded bg-white text-[#111111] border border-gray-300 hover:bg-gray-50 transition-colors duration-200"
                >
                  Sign Up / Sign In
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-6xl px-6 py-8 md:py-12">
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
                    <div>
                      <h2 className="text-xl md:text-2xl font-semibold text-[#111111]">{plan.title}</h2>
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
                        {/* Arrows replace thumbnails on mobile (above) */}

                        {/* Finance controls (mobile) */}
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
                              <Label className="text-[#111111]">Months</Label>
                              <span className="text-sm text-[#111111]">{months}</span>
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
                          <div className="pt-1 flex items-center justify-between">
                            <span className="text-sm font-medium text-[#111111]">Estimated Monthly</span>
                            <span className="text-sm text-[#111111]">$—/mo</span>
                          </div>
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
                        {/* Arrows shown on image area; thumbnails removed */}

                        {/* Finance controls (desktop/tablet) */}
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
                              <Label className="text-[#111111]">Months</Label>
                              <span className="text-sm text-[#111111]">{months}</span>
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
                          <div className="pt-1 flex items-center justify-between">
                            <span className="text-sm font-medium text-[#111111]">Estimated Monthly</span>
                            <span className="text-sm text-[#111111]">$—/mo</span>
                          </div>
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
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

export default App
