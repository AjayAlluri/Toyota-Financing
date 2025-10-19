import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { motion } from 'framer-motion'
import { 
  Car, 
  Users, 
  FileText, 
  TrendingUp, 
  Download, 
  Eye, 
  User, 
  Mail, 
  DollarSign, 
  CreditCard,
  Calendar,
  Search,
  Filter,
  ArrowLeft,
  BarChart3
} from 'lucide-react'

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: 'user' | 'sales';
  created_at: string;
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
  user: User;
}

interface Document {
  id: number;
  user_id: number;
  filename: string;
  original_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  uploaded_at: string;
  user: User;
}

interface CarRecommendation {
  id: number;
  user_id: number;
  profile_id: number;
  budget_car: string;
  balanced_car: string;
  premium_car: string;
  recommendation_data: string;
  created_at: string;
  user: User;
}

export default function SalesDashboard() {
  const { user, token, logout } = useAuth()
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'profiles' | 'documents' | 'recommendations'>('overview')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  // Data states
  const [users, setUsers] = useState<User[]>([])
  const [profiles, setProfiles] = useState<UserProfile[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [recommendations, setRecommendations] = useState<CarRecommendation[]>([])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useEffect(() => {
    if (token && user?.role === 'sales') {
      fetchAllData()
    }
    // Remove the else clause - let RoleProtectedRoute handle redirects
  }, [token, user])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      const [usersRes, profilesRes, documentsRes, recommendationsRes] = await Promise.all([
        fetch('http://localhost:3000/api/sales/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:3000/api/sales/profiles', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:3000/api/sales/documents', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:3000/api/sales/recommendations', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ])

      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setUsers(usersData.users)
      }

      if (profilesRes.ok) {
        const profilesData = await profilesRes.json()
        setProfiles(profilesData.profiles)
      }

      if (documentsRes.ok) {
        const documentsData = await documentsRes.json()
        setDocuments(documentsData.documents)
      }

      if (recommendationsRes.ok) {
        const recommendationsData = await recommendationsRes.json()
        setRecommendations(recommendationsData.recommendations)
      }
    } catch (error) {
      console.error('Error fetching sales data:', error)
      setError('Failed to load sales data')
    } finally {
      setLoading(false)
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

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.last_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredProfiles = profiles.filter(profile => 
    profile.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.user.last_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredDocuments = documents.filter(doc => 
    doc.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.original_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredRecommendations = recommendations.filter(rec => 
    rec.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rec.user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rec.user.last_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white flex items-center justify-center" style={{ cursor: 'none' }}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-white/60">Loading sales dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white overflow-hidden" style={{ cursor: 'none' }}>
      {/* Custom Cursor with Blue Glow */}
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
          <div className="absolute inset-0 w-8 h-8 bg-blue-500/20 rounded-full blur-lg animate-ping"></div>
          {/* Outer glow */}
          <div className="absolute inset-0 w-6 h-6 bg-blue-500/30 rounded-full blur-md animate-pulse"></div>
          {/* Inner glow */}
          <div className="absolute inset-0 w-4 h-4 bg-blue-400/50 rounded-full blur-sm"></div>
          {/* Core cursor */}
          <div className="w-3 h-3 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50"></div>
        </div>
      </motion.div>

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
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
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold">
                Sales <span className="text-blue-500">Dashboard</span>
              </div>
            </motion.div>
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              to="/"
              className="group flex items-center gap-2 px-4 py-2 text-white/90 hover:text-white transition-all duration-200 hover:bg-white/10 rounded-lg"
            >
              <ArrowLeft className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Back to Home
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
      <main className="mx-auto max-w-7xl px-6 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-semibold mb-2">Welcome, {user?.firstName}!</h1>
          <p className="text-white/60">Sales Dashboard - View and manage customer data</p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-6 bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-xl px-4 py-3 text-red-400"
          >
            {error}
          </motion.div>
        )}

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-6"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
            <input
              type="text"
              placeholder="Search users, profiles, documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-8"
        >
          <div className="flex space-x-1 bg-white/5 backdrop-blur-sm rounded-xl p-1 border border-white/10">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'profiles', label: 'Profiles', icon: User },
              { id: 'documents', label: 'Documents', icon: FileText },
              { id: 'recommendations', label: 'Recommendations', icon: Car }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 shadow-lg overflow-hidden"
        >
          {activeTab === 'overview' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                Dashboard Overview
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <div className="flex items-center gap-3 mb-3">
                    <Users className="w-8 h-8 text-blue-500" />
                    <div>
                      <h3 className="text-lg font-semibold">Total Users</h3>
                      <p className="text-2xl font-bold text-blue-400">{users.length}</p>
                    </div>
                  </div>
                  <p className="text-white/60 text-sm">Registered customers</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <div className="flex items-center gap-3 mb-3">
                    <User className="w-8 h-8 text-green-500" />
                    <div>
                      <h3 className="text-lg font-semibold">Profiles</h3>
                      <p className="text-2xl font-bold text-green-400">{profiles.length}</p>
                    </div>
                  </div>
                  <p className="text-white/60 text-sm">Completed profiles</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <div className="flex items-center gap-3 mb-3">
                    <FileText className="w-8 h-8 text-purple-500" />
                    <div>
                      <h3 className="text-lg font-semibold">Documents</h3>
                      <p className="text-2xl font-bold text-purple-400">{documents.length}</p>
                    </div>
                  </div>
                  <p className="text-white/60 text-sm">Uploaded files</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <div className="flex items-center gap-3 mb-3">
                    <Car className="w-8 h-8 text-red-500" />
                    <div>
                      <h3 className="text-lg font-semibold">Recommendations</h3>
                      <p className="text-2xl font-bold text-red-400">{recommendations.length}</p>
                    </div>
                  </div>
                  <p className="text-white/60 text-sm">Generated quotes</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                All Users ({filteredUsers.length})
              </h2>
              <div className="space-y-3">
                {filteredUsers.map((user) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/15 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{user.first_name} {user.last_name}</h3>
                        <p className="text-white/60 text-sm">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        user.role === 'sales' 
                          ? 'bg-blue-500/20 text-blue-400' 
                          : 'bg-green-500/20 text-green-400'
                      }`}>
                        {user.role}
                      </span>
                      <span className="text-white/40 text-sm">
                        {formatDate(user.created_at)}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'profiles' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-green-500" />
                User Profiles ({filteredProfiles.length})
              </h2>
              <div className="space-y-4">
                {filteredProfiles.map((profile) => (
                  <motion.div
                    key={profile.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/15 transition-all duration-200"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{profile.user.first_name} {profile.user.last_name}</h3>
                          <p className="text-white/60 text-sm">{profile.user.email}</p>
                        </div>
                      </div>
                      <span className="text-white/40 text-sm">
                        {formatDate(profile.created_at)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      {profile.gross_monthly_income && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-green-500" />
                          <span className="text-white/60">Income:</span>
                          <span className="text-white">${profile.gross_monthly_income.toLocaleString()}</span>
                        </div>
                      )}
                      {profile.credit_score && (
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-green-500" />
                          <span className="text-white/60">Credit:</span>
                          <span className="text-white">{profile.credit_score}</span>
                        </div>
                      )}
                      {profile.down_payment && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-green-500" />
                          <span className="text-white/60">Down Payment:</span>
                          <span className="text-white">${profile.down_payment.toLocaleString()}</span>
                        </div>
                      )}
                      {profile.ownership_horizon && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-green-500" />
                          <span className="text-white/60">Horizon:</span>
                          <span className="text-white">{profile.ownership_horizon}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-500" />
                Documents ({filteredDocuments.length})
              </h2>
              <div className="space-y-3">
                {filteredDocuments.map((doc) => (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/15 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-purple-500" />
                      <div>
                        <h3 className="font-semibold text-white">{doc.original_name}</h3>
                        <p className="text-white/60 text-sm">
                          {doc.user.first_name} {doc.user.last_name} • {formatFileSize(doc.file_size)} • {formatDate(doc.uploaded_at)}
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
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'recommendations' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Car className="w-5 h-5 text-red-500" />
                Car Recommendations ({filteredRecommendations.length})
              </h2>
              <div className="space-y-4">
                {filteredRecommendations.map((rec) => (
                  <motion.div
                    key={rec.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/15 transition-all duration-200"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                          <Car className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{rec.user.first_name} {rec.user.last_name}</h3>
                          <p className="text-white/60 text-sm">{rec.user.email}</p>
                        </div>
                      </div>
                      <span className="text-white/40 text-sm">
                        {formatDate(rec.created_at)}
                      </span>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-white/80 text-sm">
                        Generated car recommendations for this customer. 
                        <span className="text-white/60"> Click to view detailed recommendations.</span>
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  )
}
