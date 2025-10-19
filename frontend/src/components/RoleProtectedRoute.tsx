import { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface RoleProtectedRouteProps {
  children: ReactNode
  requiredRole: 'user' | 'sales'
  fallbackPath?: string
}

export function RoleProtectedRoute({ 
  children, 
  requiredRole, 
  fallbackPath = '/' 
}: RoleProtectedRouteProps) {
  const { user, token, loading } = useAuth()
  const location = useLocation()

  // Show loading state while authentication is being verified
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mb-4"></div>
          <p className="text-white/60">Loading...</p>
        </div>
      </div>
    )
  }

  // If not authenticated, redirect to sign in
  if (!token || !user) {
    return <Navigate to="/signin" state={{ from: location }} replace />
  }

  // If user doesn't have the required role, redirect to fallback
  if (user.role !== requiredRole) {
    return <Navigate to={fallbackPath} replace />
  }

  return <>{children}</>
}
