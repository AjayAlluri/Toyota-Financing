import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

// Landing page (home): black hero with blended header and right-aligned nav
export default function Landing() {
  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* Background image layer with gradient overlay */}
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
        {/* Image anchored bottom-right; adjust size responsively */}
        <div
          className="absolute inset-0 opacity-100"
          style={{
            backgroundImage: "url(/landing-hero.png)",
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right calc(100% + 105px)',
            backgroundSize: 'cover'
          }}
        />
        {/* Global low-opacity black overlay over the entire background */}
        <div className="absolute inset-0 bg-black/45" />
      </div>
      <motion.div
        className="relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      >
        {/* Header (visually blended with black background) */}
        <header className="w-full">
          <div className="mx-auto max-w-7xl px-6 py-4 flex items-start justify-between">
            {/* Brand + subtitle (left) */}
            <Link to="/">
              <div className="leading-tight">
                <div className="text-base sm:text-xl md:text-2xl font-semibold text-white">
                  Toyota <span className="text-[#E50914]">Quote</span>
                </div>
              </div>
            </Link>

            {/* Right-aligned nav actions */}
            <nav className="flex items-center gap-3">
              <Link
                to="/carRec"
                state={{ startQuiz: true }}
                className="px-3 py-1.5 text-sm font-medium text-white/90 hover:text-white transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E50914] rounded"
              >
                Forms
              </Link>
              <Link
                to="/signin"
                className="px-3 py-1.5 text-sm font-medium rounded bg-white/5 text-white hover:bg-[#E50914] hover:text-white transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E50914]"
              >
                Sign In
              </Link>
            </nav>
          </div>
        </header>

        {/* Hero area: occupies majority of viewport height */}
        <main className="mx-auto max-w-7xl px-6">
        <section className="min-h-[72vh] grid place-items-center text-center">
          {/* Hero copy without local background/outline */}
          <div className="space-y-3 inline-block px-6 py-5">
            {/* Prominent hero text */}
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-semibold tracking-tight text-white">
              Find your perfect Toyota.
            </h2>
            <p className="text-white/80 text-base md:text-lg max-w-2xl mx-auto">
              Disvover the ride that truly fits your life.
            </p>
          </div>
        </section>
        </main>

        {/* Limit scroll height naturally by content; no infinite scroll */}
        <footer className="px-6 py-25 text-center text-xs text-white/40">
          <span>© {new Date().getFullYear()} Toyota Quote — Prototype</span>
        </footer>
      </motion.div>
    </div>
  )
}


