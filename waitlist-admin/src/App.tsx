import { useState, useEffect } from 'react'
import './styles.css'

interface WaitlistUser {
  id: number
  name: string
  location: string
  phone: string
  email: string
  category: string
  created_at: string
}

const API_BASE = 'https://crysgarage.studio/waitlist-api'

function App() {
  const [users, setUsers] = useState<WaitlistUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({ total: 0, categories: {} })

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch users
      const usersResponse = await fetch(`${API_BASE}/api/waitlist/list`)
      if (!usersResponse.ok) throw new Error('Failed to fetch users')
      const usersData = await usersResponse.json()
      setUsers(usersData)

      // Fetch stats
      const countResponse = await fetch(`${API_BASE}/api/waitlist/count`)
      const categoriesResponse = await fetch(`${API_BASE}/api/waitlist/categories`)
      
      if (countResponse.ok && categoriesResponse.ok) {
        const countData = await countResponse.json()
        const categoriesData = await categoriesResponse.json()
        setStats({ total: countData.total_registrations, categories: categoriesData })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const exportToCSV = () => {
    const headers = ['Name', 'Location', 'Phone', 'Email', 'Category', 'Date']
    const csvContent = [
      headers.join(','),
      ...users.map(user => [
        `"${user.name}"`,
        `"${user.location}"`,
        `"${user.phone}"`,
        `"${user.email}"`,
        `"${user.category}"`,
        `"${new Date(user.created_at).toLocaleDateString()}"`
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `waitlist-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading waitlist data...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="card max-w-md text-center">
          <div className="text-red-400 text-xl mb-4">Error</div>
          <p className="text-white/70 mb-4">{error}</p>
          <button onClick={fetchData} className="btn btn-brand">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-700 to-brand-600 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-white mb-2">Waitlist Admin Dashboard</h1>
          <p className="text-white/90">Manage and monitor waitlist registrations</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-2">Total Registrations</h3>
            <div className="text-3xl font-bold text-brand">{stats.total}</div>
          </div>
          
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-2">Categories</h3>
            <div className="text-3xl font-bold text-brand">{Object.keys(stats.categories).length}</div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-2">Today</h3>
            <div className="text-3xl font-bold text-brand">
              {users.filter(user => {
                const today = new Date().toDateString()
                const userDate = new Date(user.created_at).toDateString()
                return today === userDate
              }).length}
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-2">This Week</h3>
            <div className="text-3xl font-bold text-brand">
              {users.filter(user => {
                const weekAgo = new Date()
                weekAgo.setDate(weekAgo.getDate() - 7)
                return new Date(user.created_at) > weekAgo
              }).length}
            </div>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="card mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">Category Distribution</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(stats.categories).map(([category, count]) => (
              <div key={category} className="bg-white/5 p-4 rounded border border-white/10">
                <div className="text-white/70 text-sm">{category}</div>
                <div className="text-2xl font-bold text-brand">{count as number}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Waitlist Registrations</h2>
          <div className="flex gap-3">
            <button onClick={fetchData} className="btn btn-muted">
              Refresh
            </button>
            <button onClick={exportToCSV} className="btn btn-brand">
              Export CSV
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-white/70 font-medium">Name</th>
                <th className="text-left py-3 px-4 text-white/70 font-medium">Location</th>
                <th className="text-left py-3 px-4 text-white/70 font-medium">Phone</th>
                <th className="text-left py-3 px-4 text-white/70 font-medium">Email</th>
                <th className="text-left py-3 px-4 text-white/70 font-medium">Category</th>
                <th className="text-left py-3 px-4 text-white/70 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-3 px-4 text-white">{user.name}</td>
                  <td className="py-3 px-4 text-white/80">{user.location}</td>
                  <td className="py-3 px-4 text-white/80">{user.phone}</td>
                  <td className="py-3 px-4 text-white/80">{user.email}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-brand/20 text-brand rounded text-sm">
                      {user.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-white/60">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {users.length === 0 && (
            <div className="text-center py-12 text-white/60">
              No waitlist registrations yet
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
