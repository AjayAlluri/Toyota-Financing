import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react'

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
  const [selected, setSelected] = useState<PlanKey>('Comfort')
  const [mode, setMode] = useState<'finance' | 'lease'>('finance')
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

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans">
      {/* Top accent bars */}
      <div className="h-8 w-full bg-black" />
      <div className="h-1 w-full bg-[#EB0A1E]" />

      {/* Header */}
      <header className="bg-white/90 backdrop-blur border-b border-gray-200">
        <div className="mx-auto max-w-6xl px-6 py-6 md:py-8">
          <div className="flex items-baseline justify-between">
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-[#111111]">
              TOYOTA <span className="text-[#EB0A1E]">Quote</span>
            </h1>
            <p className="text-sm md:text-base text-[#9CA3AF]">Personalized Recommendation</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-6xl px-6 py-8 md:py-12">
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

                        {/* Match meter */}
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-[#111111]">Match</span>
                            <span className="text-sm text-[#111111]">{plan.match}%</span>
                          </div>
                          <div className="mt-2 h-3 w-full rounded-full bg-gray-200 overflow-hidden">
                            <motion.div
                              className="h-full rounded-full bg-[#EB0A1E]"
                              initial={{ width: 0 }}
                              animate={{ width: `${plan.match}%` }}
                              transition={{ duration: 0.8, ease: 'easeOut' }}
                            />
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

                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-[#111111]">Match</span>
                            <span className="text-sm text-[#111111]">{plan.match}%</span>
                          </div>
                          <div className="mt-2 h-3 w-full rounded-full bg-gray-200 overflow-hidden">
                            <motion.div
                              className="h-full rounded-full bg-[#EB0A1E]"
                              initial={{ width: 0 }}
                              animate={{ width: `${plan.match}%` }}
                              transition={{ duration: 0.8, ease: 'easeOut' }}
                            />
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
      </main>
    </div>
  )
}

export default App
