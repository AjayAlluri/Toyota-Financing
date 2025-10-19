import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Landing from './pages/Landing.tsx'
import SignIn from './pages/SignIn.tsx'

// Router configuration
const router = createBrowserRouter([
  // Home routes (landing)
  { path: '/', element: <Landing /> },
  { path: '/landing', element: <Landing /> },

  // Existing carRec page preserved as-is (App)
  { path: '/carRec', element: <App /> },

  // Temporary sign in page
  { path: '/signin', element: <SignIn /> },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
