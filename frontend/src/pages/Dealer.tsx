import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'

export default function Dealer() {
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

  if (user.role !== 'sales') {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You need sales permissions to access this page.</p>
          <Link to="/profile" className="text-[#EB0A1E] hover:underline">
            Go to your profile
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
                Toyota <span className="text-[#EB0A1E]">Sales Portal</span>
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
      <main className="mx-auto max-w-6xl px-6 py-8 md:py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-[#111111] mb-2">Sales Dashboard</h2>
          <p className="text-gray-600">Welcome back, {user.full_name || user.email}!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Sales Stats Cards */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-[#111111] mb-2">Today's Leads</h3>
            <div className="text-3xl font-bold text-[#EB0A1E] mb-1">12</div>
            <p className="text-sm text-gray-600">+3 from yesterday</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-[#111111] mb-2">Active Quotes</h3>
            <div className="text-3xl font-bold text-[#EB0A1E] mb-1">8</div>
            <p className="text-sm text-gray-600">3 pending approval</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-[#111111] mb-2">Monthly Sales</h3>
            <div className="text-3xl font-bold text-[#EB0A1E] mb-1">24</div>
            <p className="text-sm text-gray-600">Target: 30</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Leads */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-[#111111] mb-4">Recent Leads</h3>
            <div className="space-y-3">
              {[
                { name: 'John Smith', email: 'john@example.com', interest: 'Camry Hybrid', time: '2 hours ago' },
                { name: 'Sarah Johnson', email: 'sarah@example.com', interest: 'RAV4', time: '4 hours ago' },
                { name: 'Mike Wilson', email: 'mike@example.com', interest: 'Prius', time: '6 hours ago' },
              ].map((lead, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-[#111111]">{lead.name}</div>
                    <div className="text-sm text-gray-600">{lead.email}</div>
                    <div className="text-sm text-[#EB0A1E]">{lead.interest}</div>
                  </div>
                  <div className="text-sm text-gray-500">{lead.time}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-[#111111] mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full text-left p-4 bg-[#EB0A1E] text-white rounded-lg hover:opacity-90 transition-opacity">
                <div className="font-medium">Create New Quote</div>
                <div className="text-sm opacity-90">Generate a financing quote for a customer</div>
              </button>
              
              <button className="w-full text-left p-4 bg-gray-100 text-[#111111] rounded-lg hover:bg-gray-200 transition-colors">
                <div className="font-medium">View All Leads</div>
                <div className="text-sm text-gray-600">Browse and manage customer leads</div>
              </button>
              
              <button className="w-full text-left p-4 bg-gray-100 text-[#111111] rounded-lg hover:bg-gray-200 transition-colors">
                <div className="font-medium">Sales Reports</div>
                <div className="text-sm text-gray-600">View performance analytics</div>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
