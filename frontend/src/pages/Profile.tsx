import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'

export default function Profile() {
  const { user, signOut } = useAuth()

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">Not authenticated</h1>
          <Link to="/signin" className="text-[#EB0A1E] hover:underline">
            Please sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur border-b border-gray-200">
        <div className="mx-auto max-w-6xl px-6 py-4 md:py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-[#111111]">
                Toyota <span className="text-[#EB0A1E]">Quote</span>
              </h1>
            </div>
            <nav className="flex items-center gap-3">
              <Link
                to="/"
                className="px-3 py-1.5 text-sm font-medium rounded bg-[#111111] text-white hover:opacity-90 transition-opacity duration-200"
              >
                Home
              </Link>
              <button
                onClick={signOut}
                className="px-3 py-1.5 text-sm font-medium rounded bg-white text-[#111111] border border-gray-300 hover:bg-gray-50 transition-colors duration-200"
              >
                Sign Out
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-6 py-8 md:py-12">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-[#111111] mb-6">Your Profile</h2>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <div className="px-3 py-2 bg-gray-50 rounded border text-gray-900">
                  {user.full_name || 'Not provided'}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <div className="px-3 py-2 bg-gray-50 rounded border text-gray-900">
                  {user.email}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <div className="px-3 py-2 bg-gray-50 rounded border text-gray-900">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {user.role}
                  </span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">User ID</label>
                <div className="px-3 py-2 bg-gray-50 rounded border text-gray-900 font-mono text-sm">
                  {user.id}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-[#111111] mb-4">Your Saved Quotes</h3>
              <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
                <p>No saved quotes yet.</p>
                <Link 
                  to="/" 
                  className="text-[#EB0A1E] hover:underline mt-2 inline-block"
                >
                  Start browsing cars
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
