import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'

// Temporary Sign In page with email/password fields
export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    // Placeholder action
    alert(`Signing in as ${email}`)
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
            <h2 className="text-2xl font-semibold">Sign In</h2>
            <p className="text-white/60 text-sm mt-1">Access your saved quotes</p>
          </div>

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
              className="w-full rounded bg-white/5 text-white placeholder-white/40 px-3 py-2 outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-[#E50914] transition duration-200"
              placeholder="••••••••"
            />
          </label>

          {/* Submit */}
          <button
            type="submit"
            className="w-full rounded bg-[#E50914] text-white font-semibold px-4 py-2 hover:opacity-90 focus:opacity-90 transition-opacity duration-200"
          >
            Sign In
          </button>
        </form>
      </main>

      <footer className="px-6 py-8 text-center text-xs text-white/40">
        <span>© {new Date().getFullYear()} Toyota Quote — Prototype</span>
      </footer>
    </div>
  )
}


