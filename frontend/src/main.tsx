import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Landing from './pages/Landing.tsx'
import SignIn from './pages/SignIn.tsx'
import UploadDocuments from './pages/UploadDocuments.tsx'
import FindDealership from './pages/FindDealership.tsx'

// Router configuration
const router = createBrowserRouter([
  // Home routes (landing)
  { path: '/', element: <Landing /> },
  { path: '/landing', element: <Landing /> },

  { path: '/carRec', element: <App /> },

  { path: '/signin', element: <SignIn /> },
  { path: '/upload', element: <UploadDocuments /> },
  { path: '/dealers', element: <FindDealership /> },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
