import { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface ProtectedRouteProps {
  children: ReactNode
  requiredRole?: 'user' | 'sales'
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#EB0A1E] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    // Redirect to sign in page with return URL
    return <Navigate to="/signin" state={{ from: location }} replace />
  }

  if (requiredRole && user.role !== requiredRole) {
    // Redirect to appropriate page based on user role
    const redirectTo = user.role === 'sales' ? '/dealer' : '/profile'
    return <Navigate to={redirectTo} replace />
  }

  return <>{children}</>
}

// Convenience components for specific roles
export function UserRoute({ children }: { children: ReactNode }) {
  return <ProtectedRoute requiredRole="user">{children}</ProtectedRoute>
}

export function SalesRoute({ children }: { children: ReactNode }) {
  return <ProtectedRoute requiredRole="sales">{children}</ProtectedRoute>
}
