import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

// Sign In page with email/password fields and registration
export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  const from = (location.state as any)?.from?.pathname || '/'
  const customMessage = (location.state as any)?.message
  const quoteData = (location.state as any)?.answers
  const selectedPlan = (location.state as any)?.selectedPlan

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isRegistering) {
        await register(email, password, firstName, lastName)
      } else {
        await login(email, password)
      }
      // Navigate to profile with quote data if available
      navigate('/profile', { 
        replace: true,
        state: { 
          answers: quoteData,
          selectedPlan: selectedPlan,
          showUploadPrompt: true
        }
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header matching landing style */}
      <header className="w-full">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight">
            Toyota <span className="text-[#E50914]">Quote</span>
          </Link>
          <nav className="ml-auto flex items-center gap-4 sm:gap-6">
            <Link
              to="/carRec"
              className="px-4 py-2 text-base font-medium text-white/90 hover:text-white transition-colors duration-200 ease-in-out rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E50914]"
            >
              Forms
            </Link>
            <Link
              to="/"
              className="px-4 py-2 text-base font-medium rounded bg-white/5 text-white hover:bg-[#E50914] hover:text-white transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E50914]"
            >
              Home
            </Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 mx-auto w-full max-w-md px-6 grid place-items-center">
        <form onSubmit={onSubmit} className="w-full space-y-5">
          <div className="text-center mb-2">
            <h2 className="text-2xl font-semibold">
              {isRegistering ? 'Create Account' : 'Sign In'}
            </h2>
            <p className="text-white/60 text-sm mt-1">
              {customMessage || (isRegistering ? 'Start saving your quotes' : 'Access your saved quotes')}
            </p>
            {quoteData && (
              <div className="mt-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-green-400 text-sm">
                  🎉 Your Toyota quote is ready! Sign in to save it and upload your documents.
                </p>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded px-3 py-2 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Registration fields */}
          {isRegistering && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="block text-sm mb-1 text-white/80">First Name</span>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="w-full rounded bg-white/5 text-white placeholder-white/40 px-3 py-2 outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-[#E50914] transition duration-200"
                    placeholder="John"
                  />
                </label>
                <label className="block">
                  <span className="block text-sm mb-1 text-white/80">Last Name</span>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="w-full rounded bg-white/5 text-white placeholder-white/40 px-3 py-2 outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-[#E50914] transition duration-200"
                    placeholder="Doe"
                  />
                </label>
              </div>
            </>
          )}

          {/* Email */}
          <label className="block">
            <span className="block text-sm mb-1 text-white/80">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded bg-white/5 text-white placeholder-white/40 px-3 py-2 outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-[#E50914] transition duration-200"
              placeholder="you@example.com"
            />
          </label>

          {/* Password */}
          <label className="block">
            <span className="block text-sm mb-1 text-white/80">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded bg-white/5 text-white placeholder-white/40 px-3 py-2 outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-[#E50914] transition duration-200"
              placeholder="••••••••"
            />
            {isRegistering && (
              <p className="text-white/40 text-xs mt-1">Minimum 6 characters</p>
            )}
          </label>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-[#E50914] text-white font-semibold px-4 py-2 hover:opacity-90 focus:opacity-90 transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Please wait...' : (isRegistering ? 'Create Account' : 'Sign In')}
          </button>

          {/* Toggle between login and register */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering)
                setError('')
              }}
              className="text-white/60 hover:text-white transition-colors duration-200 text-sm"
            >
              {isRegistering 
                ? 'Already have an account? Sign in' 
                : "Don't have an account? Create one"
              }
            </button>
          </div>
        </form>
      </main>

      <footer className="px-6 py-8 text-center text-xs text-white/40">
        <span>© {new Date().getFullYear()} Toyota Quote — Prototype</span>
      </footer>
    </div>
  )
}


