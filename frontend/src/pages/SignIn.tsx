import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

// Sign In / Sign Up page with Supabase Auth
export default function SignIn() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, signUp, redirectAfterLogin } = useAuth()
  const navigate = useNavigate()

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isSignUp) {
        await signUp(email, password, fullName || undefined)
      } else {
        await signIn(email, password)
      }
      
      // Redirect based on user role after successful authentication
      redirectAfterLogin()
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header matching landing style */}
      <header className="w-full">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <Link to="/">
          <h1 className="sr-only">Toyota Quote</h1>
          </Link>
          <nav className="ml-auto flex items-center gap-4">
            <Link
              to="/carRec"
              className="px-4 py-2 text-sm font-medium text-white/90 hover:text-white transition-colors duration-200 ease-in-out rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E50914]"
            >
              Forms
            </Link>
            <Link
              to="/"
              className="px-4 py-2 text-sm font-medium rounded bg-white/5 text-white hover:bg-[#E50914] hover:text-white transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E50914]"
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
            <h2 className="text-2xl font-semibold">{isSignUp ? 'Sign Up' : 'Sign In'}</h2>
            <p className="text-white/60 text-sm mt-1">
              {isSignUp ? 'Create your account' : 'Access your saved quotes'}
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded px-3 py-2 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Full Name (Sign Up only) */}
          {isSignUp && (
            <label className="block">
              <span className="block text-sm mb-1 text-white/80">Full Name</span>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded bg-white/5 text-white placeholder-white/40 px-3 py-2 outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-[#E50914] transition duration-200"
                placeholder="John Doe"
              />
            </label>
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
          </label>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-[#E50914] text-white font-semibold px-4 py-2 hover:opacity-90 focus:opacity-90 transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>

          {/* Toggle between Sign In and Sign Up */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError('')
              }}
              className="text-white/60 hover:text-white text-sm transition-colors duration-200"
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
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


