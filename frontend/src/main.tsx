import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Landing from './pages/Landing.tsx'
import SignIn from './pages/SignIn.tsx'
import Profile from './pages/Profile.tsx'
import Dealer from './pages/Dealer.tsx'
import { ProtectedRoute, UserRoute, SalesRoute } from './components/ProtectedRoute'

// Router configuration
const router = createBrowserRouter([
  // Home routes (landing)
  { path: '/', element: <Landing /> },
  { path: '/landing', element: <Landing /> },

  // Car recommendation app (public for now)
  { path: '/carRec', element: <App /> },

  // Authentication
  { path: '/signin', element: <SignIn /> },

  // Protected routes
  { 
    path: '/profile', 
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    )
  },
  { 
    path: '/dealer', 
    element: (
      <SalesRoute>
        <Dealer />
      </SalesRoute>
    )
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
)
