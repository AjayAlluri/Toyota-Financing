import { Request, Response, NextFunction } from 'express'
import { supabase } from './supabase'

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    email: string
    role: 'user' | 'sales'
    full_name?: string
  }
}

export interface Profile {
  id: string
  role: 'user' | 'sales'
  full_name?: string
}

/**
 * Middleware to verify JWT token and attach user info to request
 */
export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Access token required' })
    }

    // Verify the JWT token with Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' })
    }

    // Fetch user profile with role information
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role, full_name')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return res.status(401).json({ error: 'User profile not found' })
    }

    // Attach user info to request
    req.user = {
      id: user.id,
      email: user.email!,
      role: profile.role,
      full_name: profile.full_name
    }

    next()
  } catch (error) {
    console.error('Authentication error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

/**
 * Middleware to require user authentication
 */
export const requireUser = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' })
  }
  next()
}

/**
 * Middleware factory to require specific role
 */
export const requireRole = (requiredRole: 'user' | 'sales') => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    if (req.user.role !== requiredRole) {
      return res.status(403).json({ 
        error: `Access denied. Required role: ${requiredRole}, user role: ${req.user.role}` 
      })
    }

    next()
  }
}

/**
 * Helper function to check if user has specific role
 */
export const hasRole = (userRole: 'user' | 'sales', requiredRole: 'user' | 'sales'): boolean => {
  return userRole === requiredRole
}

/**
 * Helper function to check if user is sales
 */
export const isSales = (userRole: 'user' | 'sales'): boolean => {
  return userRole === 'sales'
}
