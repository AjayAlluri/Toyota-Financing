import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import Landing from './pages/Landing.tsx'
import SignIn from './pages/SignIn.tsx'
import Profile from './pages/Profile.tsx'
import UploadDocuments from './pages/UploadDocuments.tsx'
import FindDealership from './pages/FindDealership.tsx'

// Router configuration
const router = createBrowserRouter([
  // Home routes (landing)
  { path: '/', element: <Landing /> },
  { path: '/landing', element: <Landing /> },

  { path: '/carRec', element: <App /> },

  { path: '/signin', element: <SignIn /> },
  { 
    path: '/profile', 
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    ) 
  },
  { path: '/upload', element: <UploadDocuments /> },
  { path: '/dealers', element: <FindDealership /> },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
)
