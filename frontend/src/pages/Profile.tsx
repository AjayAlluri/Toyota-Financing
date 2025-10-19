import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { motion } from 'framer-motion'
import { Car, Upload, FileText, Download, Trash2, User, Mail, DollarSign, CreditCard } from 'lucide-react'

interface Document {
  id: number;
  filename: string;
  original_name: string;
  file_size: number;
  mime_type: string;
  uploaded_at: string;
}

interface UserProfile {
  id: number;
  user_id: number;
  gross_monthly_income?: number;
  other_monthly_income?: number;
  fixed_monthly_expenses?: number;
  liquid_savings?: number;
  credit_score?: string;
  ownership_horizon?: string;
  annual_mileage?: string;
  passenger_needs?: string;
  commute_profile?: string;
  down_payment?: number;
  created_at: string;
  updated_at: string;
}

export default function Profile() {
  const { user, token, logout } = useAuth()
  const location = useLocation()
  const [documents, setDocuments] = useState<Document[]>([])
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])
  
  // Get quote data from navigation state
  const quoteData = (location.state as any)?.answers
  const selectedPlan = (location.state as any)?.selectedPlan
  const showUploadPrompt = (location.state as any)?.showUploadPrompt

  useEffect(() => {
    if (token) {
      fetchUserData()
    }
  }, [token])

  // Save quote data to profile if available
  useEffect(() => {
    if (token && quoteData && showUploadPrompt) {
      saveQuoteToProfile()
    }
  }, [token, quoteData, showUploadPrompt])

  const saveQuoteToProfile = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/auth/profile', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quoteData),
      })

      if (response.ok) {
        console.log('Quote data saved to profile')
        // Refresh profile data
        await fetchUserData()
      }
    } catch (error) {
      console.error('Error saving quote to profile:', error)
    }
  }

  const fetchUserData = async () => {
    try {
      const [docsResponse, profileResponse] = await Promise.all([
        fetch('http://localhost:3000/api/documents', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }),
        fetch('http://localhost:3000/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })
      ])

      if (docsResponse.ok) {
        const docsData = await docsResponse.json()
        setDocuments(docsData.documents || [])
      }

      if (profileResponse.ok) {
        const profileData = await profileResponse.json()
        setProfile(profileData.profile)
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      setError('Failed to load user data')
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !token) return

    setUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('document', file)

      const response = await fetch('http://localhost:3000/api/documents/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      })

      if (response.ok) {
        await fetchUserData() // Refresh documents list
      } else {
        const data = await response.json()
        setError(data.error || 'Upload failed')
      }
    } catch (error) {
      setError('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteDocument = async (documentId: number) => {
    if (!token) return

    try {
      const response = await fetch(`http://localhost:3000/api/documents/${documentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        await fetchUserData() // Refresh documents list
      } else {
        setError('Failed to delete document')
      }
    } catch (error) {
      setError('Failed to delete document')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white flex items-center justify-center" style={{ cursor: 'none' }}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mb-4"></div>
          <p className="text-white/60">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white overflow-hidden" style={{ cursor: 'none' }}>
      {/* Custom Cursor with Red Glow */}
      <motion.div
        className="fixed pointer-events-none z-50"
        style={{
          left: mousePosition.x,
          top: mousePosition.y,
        }}
        animate={{
          x: -12,
          y: -12,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 28
        }}
      >
        <div className="relative">
          {/* Trail effect */}
          <div className="absolute inset-0 w-8 h-8 bg-red-500/20 rounded-full blur-lg animate-ping"></div>
          {/* Outer glow */}
          <div className="absolute inset-0 w-6 h-6 bg-red-500/30 rounded-full blur-md animate-pulse"></div>
          {/* Inner glow */}
          <div className="absolute inset-0 w-4 h-4 bg-red-400/50 rounded-full blur-sm"></div>
          {/* Core cursor */}
          <div className="w-3 h-3 bg-red-500 rounded-full shadow-lg shadow-red-500/50"></div>
        </div>
      </motion.div>

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <header className="w-full backdrop-blur-sm bg-black/20 border-b border-white/10 relative z-10">
        <div className="mx-auto max-w-7xl px-6 py-6 flex items-center justify-between">
          <Link to="/" className="group">
            <motion.div
              className="flex items-center gap-3"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                <Car className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold">
                Toyota <span className="text-red-500">Quote</span>
              </div>
            </motion.div>
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              to="/carRec"
              state={{ startQuiz: true }}
              className="group flex items-center gap-2 px-4 py-2 text-white/90 hover:text-white transition-all duration-200 hover:bg-white/10 rounded-lg"
            >
              <Car className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Get Quote
            </Link>
            <button
              onClick={logout}
              className="px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-red-500/25"
            >
              Sign Out
            </button>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-6 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-semibold mb-2">Welcome back, {user?.firstName}!</h1>
          <p className="text-white/60">Manage your profile and documents</p>
        </motion.div>

        {/* Quote Summary and Upload Prompt */}
        {quoteData && showUploadPrompt && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8 bg-white/5 backdrop-blur-sm border border-green-500/20 rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-start gap-4">
              <div className="text-4xl">🎉</div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-green-400 mb-2">Your Toyota Quote is Ready!</h2>
                <p className="text-white/80 mb-4">
                  Your personalized Toyota recommendations have been saved to your profile. 
                  Now upload your documents to complete your financing application.
                </p>
                {selectedPlan && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4 border border-white/10">
                    <h3 className="font-semibold text-white mb-2">Selected Plan: {selectedPlan}</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {quoteData.gross_monthly_income && (
                        <div>
                          <span className="text-white/60">Monthly Income:</span>
                          <p className="text-white">${quoteData.gross_monthly_income.toLocaleString()}</p>
                        </div>
                      )}
                      {quoteData.credit_score && (
                        <div>
                          <span className="text-white/60">Credit Score:</span>
                          <p className="text-white">{quoteData.credit_score}</p>
                        </div>
                      )}
                      {quoteData.down_payment && (
                        <div>
                          <span className="text-white/60">Down Payment:</span>
                          <p className="text-white">${quoteData.down_payment.toLocaleString()}</p>
                        </div>
                      )}
                      {quoteData.ownership_horizon && (
                        <div>
                          <span className="text-white/60">Ownership Plan:</span>
                          <p className="text-white">{quoteData.ownership_horizon}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <div className="bg-blue-500/10 backdrop-blur-sm border border-blue-500/20 rounded-xl p-4">
                  <h4 className="font-semibold text-blue-400 mb-2">📄 Recommended Documents to Upload:</h4>
                  <ul className="text-white/80 text-sm space-y-1">
                    <li>• Driver's License</li>
                    <li>• Pay stubs (last 2-3 months)</li>
                    <li>• Bank statements</li>
                    <li>• Proof of insurance</li>
                    <li>• Trade-in title (if applicable)</li>
                  </ul>
                </div>
                <div className="mt-4 flex gap-3">
                  <Link
                    to="/carRec"
                    state={{ startQuiz: true }}
                    className="px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 transition-all duration-200 text-sm border border-white/20"
                  >
                    Modify Quote
                  </Link>
                  <button
                    onClick={() => {
                      // Clear the upload prompt after user acknowledges
                      window.history.replaceState({}, document.title)
                      window.location.reload()
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 text-sm shadow-lg hover:shadow-green-500/25"
                  >
                    Got it, let's upload documents
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-6 bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-xl px-4 py-3 text-red-400"
          >
            {error}
          </motion.div>
        )}

        {/* Profile Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-8 bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 shadow-lg"
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-red-500" />
            Profile Information
          </h2>
          {profile ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                <Mail className="w-4 h-4 text-red-500" />
                <div>
                  <span className="text-white/60 text-sm">Email:</span>
                  <p className="text-white">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                <User className="w-4 h-4 text-red-500" />
                <div>
                  <span className="text-white/60 text-sm">Name:</span>
                  <p className="text-white">{user?.firstName} {user?.lastName}</p>
                </div>
              </div>
              {profile.gross_monthly_income && (
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                  <DollarSign className="w-4 h-4 text-red-500" />
                  <div>
                    <span className="text-white/60 text-sm">Monthly Income:</span>
                    <p className="text-white">${profile.gross_monthly_income.toLocaleString()}</p>
                  </div>
                </div>
              )}
              {profile.credit_score && (
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                  <CreditCard className="w-4 h-4 text-red-500" />
                  <div>
                    <span className="text-white/60 text-sm">Credit Score:</span>
                    <p className="text-white">{profile.credit_score}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-white/60">No profile information available. Complete a quote to save your preferences.</p>
          )}
        </motion.div>

        {/* Document Upload */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-8 bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 shadow-lg"
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5 text-red-500" />
            Upload Documents
          </h2>
          <div className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center bg-white/5 backdrop-blur-sm">
            <input
              type="file"
              id="file-upload"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,.txt"
            />
            <label
              htmlFor="file-upload"
              className={`cursor-pointer inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                uploading
                  ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-red-500/25'
              }`}
            >
              <Upload className="w-4 h-4" />
              {uploading ? 'Uploading...' : 'Choose File'}
            </label>
            <p className="text-white/60 text-sm mt-3">
              PDF, images, Word documents, and text files up to 10MB
            </p>
          </div>
        </motion.div>

        {/* Documents List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 shadow-lg"
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-red-500" />
            Your Documents
          </h2>
          {documents.length > 0 ? (
            <div className="space-y-3">
              {documents.map((doc, index) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/15 transition-all duration-200"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <FileText className="w-5 h-5 text-red-500" />
                    <div className="flex-1">
                      <h3 className="font-medium text-white">{doc.original_name}</h3>
                      <p className="text-white/60 text-sm">
                        {formatFileSize(doc.file_size)} • {formatDate(doc.uploaded_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={`http://localhost:3000/api/documents/${doc.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-sm hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
                    >
                      <Download className="w-3 h-3" />
                      Download
                    </a>
                    <button
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg text-sm hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-red-500/25"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-white/30 mx-auto mb-3" />
              <p className="text-white/60">No documents uploaded yet.</p>
              <p className="text-white/40 text-sm mt-1">Upload your first document to get started</p>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  )
}
