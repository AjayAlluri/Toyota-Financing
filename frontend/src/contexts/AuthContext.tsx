import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User } from '@supabase/supabase-js'
import { useNavigate } from 'react-router-dom'
import { supabase, auth, User as AppUser } from '../supabaseClient'

interface AuthContextType {
  user: AppUser | null
  loading: boolean
  signUp: (email: string, password: string, full_name?: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  redirectAfterLogin: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const session = await auth.getCurrentSession()
        if (session?.user) {
          await fetchUserProfile(session.user)
        }
      } catch (error) {
        console.error('Error getting initial session:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await fetchUserProfile(session.user)
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (supabaseUser: User) => {
    try {
      const session = await auth.getCurrentSession()
      if (!session?.access_token) {
        throw new Error('No access token available')
      }

      // Fetch user profile from backend
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/me`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        throw new Error('Failed to fetch user profile')
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
      setUser(null)
    }
  }

  const signUp = async (email: string, password: string, full_name?: string) => {
    setLoading(true)
    try {
      await auth.signUp(email, password, full_name)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      await auth.signIn(email, password)
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      await auth.signOut()
      setUser(null)
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  const redirectAfterLogin = () => {
    if (user) {
      const redirectTo = user.role === 'sales' ? '/dealer' : '/profile'
      navigate(redirectTo)
    }
  }

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    redirectAfterLogin,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
