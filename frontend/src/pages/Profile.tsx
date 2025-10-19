import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

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
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#E50914] mb-4"></div>
          <p className="text-white/60">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="w-full">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight">
            Toyota <span className="text-[#E50914]">Quote</span>
          </Link>
          <nav className="ml-auto flex items-center gap-4 sm:gap-6">
            <Link
              to="/carRec"
              className="px-4 py-2 text-base font-medium text-white/90 hover:text-white transition-colors duration-200 ease-in-out rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E50914]"
            >
              Get Quote
            </Link>
            <button
              onClick={logout}
              className="px-4 py-2 text-base font-medium rounded bg-white/5 text-white hover:bg-[#E50914] hover:text-white transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E50914]"
            >
              Sign Out
            </button>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-2">Welcome back, {user?.firstName}!</h1>
          <p className="text-white/60">Manage your profile and documents</p>
        </div>

        {/* Quote Summary and Upload Prompt */}
        {quoteData && showUploadPrompt && (
          <div className="mb-8 bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="text-4xl">🎉</div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-green-400 mb-2">Your Toyota Quote is Ready!</h2>
                <p className="text-white/80 mb-4">
                  Your personalized Toyota recommendations have been saved to your profile. 
                  Now upload your documents to complete your financing application.
                </p>
                {selectedPlan && (
                  <div className="bg-white/5 rounded-lg p-4 mb-4">
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
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
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
                    className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-sm"
                  >
                    Modify Quote
                  </Link>
                  <button
                    onClick={() => {
                      // Clear the upload prompt after user acknowledges
                      window.history.replaceState({}, document.title)
                      window.location.reload()
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    Got it, let's upload documents
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded px-4 py-3 text-red-400">
            {error}
          </div>
        )}

        {/* Profile Information */}
        <div className="mb-8 bg-white/5 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
          {profile ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-white/60">Email:</span>
                <p className="text-white">{user?.email}</p>
              </div>
              <div>
                <span className="text-white/60">Name:</span>
                <p className="text-white">{user?.firstName} {user?.lastName}</p>
              </div>
              {profile.gross_monthly_income && (
                <div>
                  <span className="text-white/60">Monthly Income:</span>
                  <p className="text-white">${profile.gross_monthly_income.toLocaleString()}</p>
                </div>
              )}
              {profile.credit_score && (
                <div>
                  <span className="text-white/60">Credit Score:</span>
                  <p className="text-white">{profile.credit_score}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-white/60">No profile information available. Complete a quote to save your preferences.</p>
          )}
        </div>

        {/* Document Upload */}
        <div className="mb-8 bg-white/5 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Upload Documents</h2>
          <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center">
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
              className={`cursor-pointer inline-flex items-center px-4 py-2 rounded-lg font-medium transition ${
                uploading
                  ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                  : 'bg-[#E50914] text-white hover:opacity-90'
              }`}
            >
              {uploading ? 'Uploading...' : 'Choose File'}
            </label>
            <p className="text-white/60 text-sm mt-2">
              PDF, images, Word documents, and text files up to 10MB
            </p>
          </div>
        </div>

        {/* Documents List */}
        <div className="bg-white/5 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Your Documents</h2>
          {documents.length > 0 ? (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between bg-white/5 rounded-lg p-4">
                  <div className="flex-1">
                    <h3 className="font-medium text-white">{doc.original_name}</h3>
                    <p className="text-white/60 text-sm">
                      {formatFileSize(doc.file_size)} • {formatDate(doc.uploaded_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={`http://localhost:3000/api/documents/${doc.id}`}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition"
                    >
                      Download
                    </a>
                    <button
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/60">No documents uploaded yet.</p>
          )}
        </div>
      </main>
    </div>
  )
}
