import React from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'

// Types
type User = {
  user_id: string
  email?: string
  name?: string
  tier?: string
}

type Master = {
  id: string
  user_id: string
  status: string
  tier?: string
  created_at: string
  detail?: any
}

type LogEntry = {
  id: string
  source: string
  level: string
  message: string
  timestamp: string
  user_id?: string
}

type DevLoginAudit = {
  id: number
  user_id: string
  role: string
  login_time: string
  ip_address?: string
  user_agent?: string
  location?: string
}

type Payment = {
  id: number
  user_id: string
  user_email: string
  amount: number
  currency: string
  tier: string
  credits: number
  payment_reference?: string
  payment_provider: string
  status: string
  created_at: string
  completed_at?: string
  metadata?: string
}

type Metrics = {
  users: number
  active_users: number
  uploads: number
  masters: number
  failed: number
  recent_uploads: number
  recent_masters: number
  total_upload_size: number
  total_master_size: number
  tier_distribution: Record<string, number>
  status_distribution: Record<string, number>
}

type Visitor = {
  id: number;
  session_id: string;
  ip_address?: string;
  country?: string;
  region?: string;
  city?: string;
  browser?: string;
  os?: string;
  device_type?: string;
  page_views: number;
  session_duration?: number;
  referrer?: string;
  language?: string;
  first_visit?: string;
  last_visit?: string;
  is_mobile: boolean;
  is_bot: boolean;
}

type WaitlistUser = {
  id: number;
  name: string;
  location: string;
  phone: string;
  email: string;
  category: string;
  created_at: string;
}

type WaitlistAnalytics = {
  total_registrations: number;
  today_registrations: number;
  category_distribution: Record<string, number>;
}

// Auth Hook
function useAuth() {
  const [token, setToken] = React.useState<string | null>(localStorage.getItem('admin_token'))
  const [user, setUser] = React.useState<{username: string} | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)

  const login = async (username: string, password: string) => {
    setIsLoading(true)
    try {
      const form = new URLSearchParams()
      form.set('username', username)
      form.set('password', password)
      const response = await fetch('https://crysgarage.studio/admin/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: form.toString()
      })
      
      if (response.ok) {
        const data = await response.json()
        setToken(data.access_token)
        setUser({ username })
        localStorage.setItem('admin_token', data.access_token)
        return true
      }
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('admin_token')
  }

  return { token, user, login, logout, isLoading }
}

// API Hooks
function useAdminBase() {
  return 'https://crysgarage.studio/admin'
}

function useAuthenticatedFetch(token: string | null) {
  return React.useCallback(async (url: string, options: RequestInit = {}) => {
    if (!token) throw new Error('No token')
    
    return fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })
  }, [token])
}

// Login Component
function Login({ onLogin }: { onLogin: (username: string, password: string) => Promise<boolean> }) {
  const [username, setUsername] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    const success = await onLogin(username, password)
    if (!success) {
      setError('Invalid credentials')
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand rounded-xl mx-auto mb-4 flex items-center justify-center">
            <span className="text-brand-foreground font-bold text-2xl">C</span>
          </div>
          <h1 className="text-2xl font-bold text-white">CrysGarage Admin</h1>
          <p className="text-white/60 mt-2">Sign in to your account</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input w-full"
              placeholder="Enter username"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input w-full"
              placeholder="Enter password"
              required
            />
          </div>
          
          {error && (
            <div className="text-red-400 text-sm">{error}</div>
          )}
          
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-brand w-full"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}

// Main App Component
function App() {
  const { token, user, login, logout, isLoading } = useAuth()
  const [tab, setTab] = React.useState<'metrics' | 'users' | 'masters' | 'logs' | 'access' | 'visitors' | 'waitlist' | 'payments'>('metrics')
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white">Loading...</div>
        </div>
      </div>
    )
  }
  
  if (!token) {
    return <Login onLogin={login} />
  }
  
  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="p-6 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <img src="/CRG_Logo_svg.svg" alt="CrysGarage" className="w-8 h-8 rounded" />
            <div>
              <div className="text-sm font-medium text-white">CrysGarage</div>
              <div className="text-xs text-white/60">Admin</div>
            </div>
          </div>
        </div>
        
        <nav className="p-4">
          <div className="space-y-1">
            <button 
              className={`nav-item w-full ${tab === 'metrics' ? 'nav-item-active' : ''}`}
              onClick={() => setTab('metrics')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Overview
            </button>
            
            <button 
              className={`nav-item w-full ${tab === 'users' ? 'nav-item-active' : ''}`}
              onClick={() => setTab('users')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              Users
            </button>
            
            <button 
              className={`nav-item w-full ${tab === 'masters' ? 'nav-item-active' : ''}`}
              onClick={() => setTab('masters')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Masters
            </button>
            
            <button 
              className={`nav-item w-full ${tab === 'logs' ? 'nav-item-active' : ''}`}
              onClick={() => setTab('logs')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              Logs
            </button>
            
            <button 
              className={`nav-item w-full ${tab === 'access' ? 'nav-item-active' : ''}`}
              onClick={() => setTab('access')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              Access
            </button>
            
            <button 
              className={`nav-item w-full ${tab === 'visitors' ? 'nav-item-active' : ''}`}
              onClick={() => setTab('visitors')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Visitors
            </button>
            
            <button 
              className={`nav-item w-full ${tab === 'waitlist' ? 'nav-item-active' : ''}`}
              onClick={() => setTab('waitlist')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Waitlist
            </button>
            
            <button 
              className={`nav-item w-full ${tab === 'payments' ? 'nav-item-active' : ''}`}
              onClick={() => setTab('payments')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Payments
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        {/* Top Bar */}
        <header className="topbar">
          <div className="text-lg font-semibold text-white">Dashboard</div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-white/70">
              Welcome, <span className="font-medium text-white">{user?.username}</span>
            </div>
            <button onClick={logout} className="btn btn-muted">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="content">
          {tab === 'metrics' && <MetricsPanel token={token} />}
          {tab === 'users' && <UsersPanel token={token} />}
          {tab === 'masters' && <MastersPanel token={token} />}
          {tab === 'logs' && <LogsPanel token={token} />}
          {tab === 'access' && <AccessPanel token={token} />}
          {tab === 'visitors' && <VisitorsPanel token={token} />}
          {tab === 'waitlist' && <WaitlistPanel token={token} />}
          {tab === 'payments' && <PaymentsPanel token={token} />}
        </main>
      </div>
    </div>
  )
}

// Panel Components
function MetricsPanel({ token }: { token: string | null }) {
  const base = useAdminBase()
  const authFetch = useAuthenticatedFetch(token)
  const [data, setData] = React.useState<Metrics | null>(null)
  const [error, setError] = React.useState<string>()

  const fetchMetrics = React.useCallback(async () => {
    try {
      const response = await authFetch(base + '/api/v1/metrics', { cache: 'no-store' })
      if (response.ok) {
        const metricsData = await response.json()
        setData(metricsData)
        setError(undefined)
      } else {
        setError('Failed to fetch metrics')
      }
    } catch (e) {
      setError(String(e))
    }
  }, [authFetch, base])

  React.useEffect(() => {
    fetchMetrics()
    const interval = setInterval(fetchMetrics, 30000)
    return () => clearInterval(interval)
  }, [fetchMetrics])

  if (error) return <div className="text-red-400">{error}</div>
  if (!data) return <div className="text-white/70">Loading...</div>

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard title="Total Users" value={data.users} />
        <MetricCard title="Active Users" value={data.active_users} />
        <MetricCard title="Total Uploads" value={data.uploads} />
        <MetricCard title="Total Masters" value={data.masters} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard title="Failed Masters" value={data.failed} />
        <MetricCard title="Recent Uploads" value={data.recent_uploads} />
        <MetricCard title="Recent Masters" value={data.recent_masters} />
        <MetricCard title="Success Rate" value={`${data.masters > 0 ? Math.round(((data.masters - data.failed) / data.masters) * 100) : 0}%`} />
      </div>
    </div>
  )
}

function UsersPanel({ token }: { token: string | null }) {
  const base = useAdminBase()
  const authFetch = useAuthenticatedFetch(token)
  const [rows, setRows] = React.useState<User[] | null>(null)
  const [error, setError] = React.useState<string>()
  const [q, setQ] = React.useState('')
  const [tier, setTier] = React.useState('')
  const [page, setPage] = React.useState(0)
  const [isSyncing, setIsSyncing] = React.useState(false)
  const [syncStatus, setSyncStatus] = React.useState<string>()
  const pageSize = 10

  const load = React.useCallback(() => {
    const params = new URLSearchParams()
    params.set('limit', String(pageSize))
    params.set('offset', String(page * pageSize))
    if (q) params.set('q', q)
    if (tier) params.set('tier', tier)

    authFetch(`${base}/api/v1/users?${params}`)
      .then(r => r.ok ? r.json() : Promise.reject(r.statusText))
      .then(setRows)
      .catch(e => setError(String(e)))
  }, [base, q, tier, page, authFetch])

  const syncFirebaseUsers = React.useCallback(async () => {
    setIsSyncing(true)
    setSyncStatus('Syncing Firebase users...')
    
    try {
      const response = await authFetch(`${base}/api/v1/sync-firebase`, {
        method: 'POST'
      })
      
      if (response.ok) {
        const result = await response.json()
        setSyncStatus(`✅ Successfully synced ${result.count || 'unknown'} Firebase users!`)
        // Reload the users list
        setTimeout(() => {
          load()
          setSyncStatus(undefined)
        }, 2000)
      } else {
        setSyncStatus('❌ Sync failed. Please try again.')
      }
    } catch (error) {
      setSyncStatus('❌ Sync error: ' + String(error))
    } finally {
      setIsSyncing(false)
    }
  }, [base, authFetch, load])

  React.useEffect(() => { load() }, [load])

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Users</h1>
        <div className="flex gap-2 items-center">
          <button 
            onClick={syncFirebaseUsers}
            disabled={isSyncing}
            className="btn btn-brand flex items-center gap-2"
          >
            {isSyncing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Syncing...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Sync Firebase
              </>
            )}
          </button>
        </div>
      </div>
      
      {syncStatus && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          syncStatus.includes('✅') ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
          syncStatus.includes('❌') ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
          'bg-blue-500/20 text-blue-400 border border-blue-500/30'
        }`}>
          {syncStatus}
        </div>
      )}
      
      <div className="flex gap-2 flex-wrap items-center mb-4">
        <input 
          value={q} 
          onChange={e => setQ(e.target.value)} 
          placeholder="Search email/name/id" 
          className="input" 
        />
        <select value={tier} onChange={e => setTier(e.target.value)} className="select">
          <option value="">All tiers</option>
          <option value="free">Free</option>
          <option value="professional">Professional</option>
          <option value="advanced">Advanced</option>
        </select>
        <button className="btn btn-brand" onClick={() => { setPage(0); load() }}>Apply</button>
      </div>
      
      {!rows ? (
        <div className="text-white/70">Loading users...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Email</th>
                <th>Name</th>
                <th>Tier</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(u => (
                <tr key={u.user_id}>
                  <td className="font-mono text-xs">{u.user_id}</td>
                  <td>{u.email || '-'}</td>
                  <td>{u.name || '-'}</td>
                  <td>{u.tier || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {rows && (
        <div className="flex justify-end items-center gap-2 mt-4">
          <button
            className="btn btn-muted"
            disabled={page === 0}
            onClick={() => setPage(p => Math.max(0, p - 1))}
          >
            Prev
          </button>
          <span className="text-white/60 text-sm">Page {page + 1}</span>
          <button
            className="btn btn-brand"
            disabled={rows.length < pageSize}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

function MastersPanel({ token }: { token: string | null }) {
  const base = useAdminBase()
  const authFetch = useAuthenticatedFetch(token)
  const [rows, setRows] = React.useState<Master[] | null>(null)
  const [error, setError] = React.useState<string>()
  const [status, setStatus] = React.useState('')
  const [tier, setTier] = React.useState('')
  const [page, setPage] = React.useState(0)
  const pageSize = 10

  const load = React.useCallback(() => {
    const params = new URLSearchParams()
    params.set('limit', String(pageSize))
    params.set('offset', String(page * pageSize))
    if (status) params.set('status', status)
    if (tier) params.set('tier', tier)

    authFetch(`${base}/api/v1/masters?${params}`)
      .then(r => r.ok ? r.json() : Promise.reject(r.statusText))
      .then(setRows)
      .catch(e => setError(String(e)))
  }, [base, status, tier, page, authFetch])

  React.useEffect(() => { load() }, [load])

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Masters</h1>
      
      <div className="flex gap-2 flex-wrap items-center mb-4">
        <select value={status} onChange={e => setStatus(e.target.value)} className="select">
          <option value="">All status</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
          <option value="queued">Queued</option>
          <option value="processing">Processing</option>
        </select>
        <select value={tier} onChange={e => setTier(e.target.value)} className="select">
          <option value="">All tiers</option>
          <option value="free">Free</option>
          <option value="professional">Professional</option>
          <option value="advanced">Advanced</option>
        </select>
        <button className="btn btn-brand" onClick={() => { setPage(0); load() }}>Apply</button>
      </div>
      
      {!rows ? (
        <div className="text-white/70">Loading masters...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>User ID</th>
                <th>Status</th>
                <th>Tier</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(m => (
                <tr key={m.id}>
                  <td className="font-mono text-xs">{m.id}</td>
                  <td className="font-mono text-xs">{m.user_id}</td>
                  <td>{m.status}</td>
                  <td>{m.tier || '-'}</td>
                  <td>{new Date(m.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {rows && (
        <div className="flex justify-end items-center gap-2 mt-4">
          <button
            className="btn btn-muted"
            disabled={page === 0}
            onClick={() => setPage(p => Math.max(0, p - 1))}
          >
            Prev
          </button>
          <span className="text-white/60 text-sm">Page {page + 1}</span>
          <button
            className="btn btn-brand"
            disabled={rows.length < pageSize}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

function LogsPanel({ token }: { token: string | null }) {
  const base = useAdminBase()
  const authFetch = useAuthenticatedFetch(token)
  const [rows, setRows] = React.useState<LogEntry[] | null>(null)
  const [error, setError] = React.useState<string>()
  const [source, setSource] = React.useState('')
  const [page, setPage] = React.useState(0)
  const pageSize = 10

  const load = React.useCallback(() => {
    const params = new URLSearchParams()
    params.set('limit', String(pageSize))
    params.set('offset', String(page * pageSize))
    if (source) params.set('source', source)

    authFetch(`${base}/api/v1/logs?${params}`)
      .then(r => r.ok ? r.json() : Promise.reject(r.statusText))
      .then(setRows)
      .catch(e => setError(String(e)))
  }, [base, source, page, authFetch])

  React.useEffect(() => { load() }, [load])

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Logs</h1>
      
      <div className="flex gap-2 flex-wrap items-center mb-4">
        <input 
          value={source} 
          onChange={e => setSource(e.target.value)} 
          placeholder="Filter by source" 
          className="input" 
        />
        <button className="btn btn-brand" onClick={() => { setPage(0); load() }}>Apply</button>
      </div>
      
      {!rows ? (
        <div className="text-white/70">Loading logs...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Source</th>
                <th>Level</th>
                <th>Message</th>
                <th>User ID</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(l => (
                <tr key={l.id}>
                  <td>{new Date(l.timestamp).toLocaleString()}</td>
                  <td>{l.source}</td>
                  <td>{l.level}</td>
                  <td className="max-w-xs truncate">{l.message}</td>
                  <td className="font-mono text-xs">{l.user_id || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {rows && (
        <div className="flex justify-end items-center gap-2 mt-4">
          <button
            className="btn btn-muted"
            disabled={page === 0}
            onClick={() => setPage(p => Math.max(0, p - 1))}
          >
            Prev
          </button>
          <span className="text-white/60 text-sm">Page {page + 1}</span>
          <button
            className="btn btn-brand"
            disabled={rows.length < pageSize}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

function AccessPanel({ token }: { token: string | null }) {
  const base = useAdminBase()
  const authFetch = useAuthenticatedFetch(token)
  const [rows, setRows] = React.useState<DevLoginAudit[] | null>(null)
  const [error, setError] = React.useState<string>()
  const [role, setRole] = React.useState('')
  const [user_id, setUser_id] = React.useState('')
  const [page, setPage] = React.useState(0)
  const pageSize = 25

  const load = React.useCallback(() => {
    const params = new URLSearchParams()
    params.set('limit', String(pageSize))
    params.set('offset', String(page * pageSize))
    if (role) params.set('role', role)
    if (user_id) params.set('user_id', user_id)

    authFetch(`${base}/api/v1/dev-login-audit?${params}`)
      .then(r => r.ok ? r.json() : Promise.reject(r.statusText))
      .then(setRows)
      .catch(e => setError(String(e)))
  }, [base, role, user_id, page, authFetch])

  React.useEffect(() => { load() }, [load])

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Access Logs</h1>
      
      <div className="flex gap-2 flex-wrap items-center mb-4">
        <select value={role} onChange={e => setRole(e.target.value)} className="select">
          <option value="">All roles</option>
          <option value="dev">Dev</option>
          <option value="partner">Partner</option>
        </select>
        <input 
          value={user_id} 
          onChange={e => setUser_id(e.target.value)} 
          placeholder="Filter by user ID" 
          className="input" 
        />
        <button className="btn btn-brand" onClick={() => { setPage(0); load() }}>Apply</button>
      </div>
      
      {!rows ? (
        <div className="text-white/70">Loading access logs...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Role</th>
                <th>Login Time</th>
                <th>IP Address</th>
                <th>Location</th>
                <th>Device</th>
                <th>Browser</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(a => (
                <tr key={a.id}>
                  <td className="font-mono text-xs">{a.user_id}</td>
                  <td>{a.role}</td>
                  <td>{new Date(a.created_at).toLocaleString()}</td>
                  <td>{a.ip_address || '-'}</td>
                  <td>{a.city && a.country ? `${a.city}, ${a.country}` : '-'}</td>
                  <td>{a.device_type || '-'}</td>
                  <td>{a.browser || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function VisitorsPanel({ token }: { token: string | null }) {
  const base = useAdminBase()
  const authFetch = useAuthenticatedFetch(token)
  const [analytics, setAnalytics] = React.useState<any>(null)
  const [visitors, setVisitors] = React.useState<Visitor[] | null>(null)
  const [error, setError] = React.useState<string>()

  const fetchAnalytics = React.useCallback(async () => {
    try {
      const response = await authFetch('https://crysgarage.studio/admin/api/v1/visitors/analytics', { cache: 'no-store' })
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
        setError(undefined)
      } else {
        setError('Failed to fetch visitor analytics')
      }
    } catch (e) {
      setError(String(e))
    }
  }, [authFetch])

  const fetchVisitors = React.useCallback(async () => {
    try {
      const response = await authFetch('https://crysgarage.studio/admin/api/v1/visitors', { cache: 'no-store' })
      if (response.ok) {
        const data = await response.json()
        setVisitors(data)
        setError(undefined)
      } else {
        setError('Failed to fetch visitors')
      }
    } catch (e) {
      setError(String(e))
    }
  }, [authFetch])

  React.useEffect(() => {
    fetchAnalytics()
    fetchVisitors()
    const interval = setInterval(() => {
      fetchAnalytics()
      fetchVisitors()
    }, 60000)
    return () => clearInterval(interval)
  }, [fetchAnalytics, fetchVisitors])

  if (error) return <div className="text-red-400">{error}</div>
  if (!analytics || !visitors) return <div className="text-white/70">Loading...</div>

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Visitors</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard title="Total Visitors" value={analytics.total_visitors} />
        <MetricCard title="Today's Visitors" value={analytics.today_visitors} />
        <MetricCard title="Today's Page Views" value={analytics.today_page_views} />
        <MetricCard title="Recent Visitors (24h)" value={analytics.recent_visitors} />
      </div>
      
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>IP Address</th>
              <th>Location</th>
              <th>Browser</th>
              <th>OS</th>
              <th>Device</th>
              <th>Page Views</th>
              <th>Last Visit</th>
            </tr>
          </thead>
          <tbody>
            {visitors.map(v => (
              <tr key={v.id}>
                <td className="font-mono text-xs">{v.ip_address || '-'}</td>
                <td>{v.city && v.country ? `${v.city}, ${v.country}` : '-'}</td>
                <td>{v.browser || '-'}</td>
                <td>{v.os || '-'}</td>
                <td>{v.device_type || '-'}</td>
                <td>{v.page_views}</td>
                <td>{v.last_visit ? new Date(v.last_visit).toLocaleString() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function WaitlistPanel({ token }: { token: string | null }) {
  const base = useAdminBase()
  const authFetch = useAuthenticatedFetch(token)
  const [analytics, setAnalytics] = React.useState<WaitlistAnalytics | null>(null)
  const [users, setUsers] = React.useState<WaitlistUser[] | null>(null)
  const [error, setError] = React.useState<string>()

  const fetchAnalytics = React.useCallback(async () => {
    try {
      const response = await authFetch('https://crysgarage.studio/waitlist-api/api/waitlist/count', { cache: 'no-store' })
      if (response.ok) {
        const countData = await response.json()
        
        const categoryResponse = await authFetch('https://crysgarage.studio/waitlist-api/api/waitlist/categories', { cache: 'no-store' })
        const categoryData = categoryResponse.ok ? await categoryResponse.json() : {}
        
        setAnalytics({
          total_registrations: countData.total_registrations || 0,
          today_registrations: 0,
          category_distribution: categoryData
        })
        setError(undefined)
      } else {
        setError('Failed to fetch waitlist analytics')
      }
    } catch (e) {
      setError(String(e))
    }
  }, [authFetch])

  const fetchUsers = React.useCallback(async () => {
    try {
      const response = await authFetch('https://crysgarage.studio/waitlist-api/api/waitlist/list', { cache: 'no-store' })
      if (response.ok) {
        const usersData = await response.json()
        setUsers(usersData)
        setError(undefined)
      } else {
        setError('Failed to fetch waitlist users')
      }
    } catch (e) {
      setError(String(e))
    }
  }, [authFetch])

  React.useEffect(() => {
    fetchAnalytics()
    fetchUsers()
    const interval = setInterval(() => {
      fetchAnalytics()
      fetchUsers()
    }, 60000)
    return () => clearInterval(interval)
  }, [fetchAnalytics, fetchUsers])

  if (error) return <div className="text-red-400">{error}</div>
  if (!analytics || !users) return <div className="text-white/70">Loading...</div>

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Waitlist</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <MetricCard title="Total Registrations" value={analytics.total_registrations} />
        <MetricCard title="Today's Registrations" value={analytics.today_registrations} />
        <MetricCard title="Categories" value={Object.keys(analytics.category_distribution).length} />
      </div>
      
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Location</th>
              <th>Phone</th>
              <th>Category</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.location}</td>
                <td>{user.phone}</td>
                <td>{user.category}</td>
                <td>{new Date(user.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function PaymentsPanel({ token }: { token: string | null }) {
  const base = useAdminBase()
  const authFetch = useAuthenticatedFetch(token)
  const [payments, setPayments] = React.useState<Payment[] | null>(null)
  const [analytics, setAnalytics] = React.useState<any>(null)
  const [error, setError] = React.useState<string>()
  const [page, setPage] = React.useState(0)
  const pageSize = 10

  const fetchPayments = React.useCallback(async () => {
    if (!token) return
    try {
      const response = await authFetch(`${base}/api/v1/payments?limit=${pageSize}&offset=${page * pageSize}`)
      if (response.ok) {
        const data = await response.json()
        setPayments(data.payments || [])
      } else {
        setError('Failed to fetch payments')
      }
    } catch (err) {
      setError('Error fetching payments')
    }
  }, [authFetch, base, token, page, pageSize])

  const fetchAnalytics = React.useCallback(async () => {
    if (!token) return
    try {
      const response = await authFetch(`${base}/api/v1/payments/analytics`)
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (err) {
      console.error('Error fetching payment analytics:', err)
    }
  }, [authFetch, base, token])

  React.useEffect(() => {
    fetchPayments()
    fetchAnalytics()
    const interval = setInterval(() => {
      fetchPayments()
      fetchAnalytics()
    }, 60000)
    return () => clearInterval(interval)
  }, [fetchPayments, fetchAnalytics])

  if (error) return <div className="text-red-400">{error}</div>
  if (!payments || !analytics) return <div className="text-white/70">Loading...</div>

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Payments</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard title="Total Revenue" value={`$${analytics.total_revenue?.toFixed(2) || '0.00'}`} />
        <MetricCard title="Total Transactions" value={analytics.total_transactions || 0} />
        <MetricCard title="Today's Revenue" value={`$${analytics.today_revenue?.toFixed(2) || '0.00'}`} />
        <MetricCard title="Today's Transactions" value={analytics.today_transactions || 0} />
      </div>

      {analytics.tier_breakdown && Object.keys(analytics.tier_breakdown).length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Revenue by Tier</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(analytics.tier_breakdown).map(([tier, data]: [string, any]) => (
              <div key={tier} className="metric-card">
                <div className="text-sm text-white/70 mb-2">{tier.charAt(0).toUpperCase() + tier.slice(1)}</div>
                <div className="text-xl font-bold text-white">${data.revenue?.toFixed(2) || '0.00'}</div>
                <div className="text-sm text-white/50">{data.count} transactions</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>User Email</th>
              <th>Amount</th>
              <th>Tier</th>
              <th>Credits</th>
              <th>Status</th>
              <th>Provider</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(payment => (
              <tr key={payment.id}>
                <td>{payment.id}</td>
                <td>{payment.user_email}</td>
                <td>${payment.amount.toFixed(2)}</td>
                <td>{payment.tier}</td>
                <td>{payment.credits}</td>
                <td>
                  <span className={`px-2 py-1 rounded text-xs ${
                    payment.status === 'completed' 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {payment.status}
                  </span>
                </td>
                <td>{payment.payment_provider}</td>
                <td>{new Date(payment.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {payments.length >= pageSize && (
        <div className="flex justify-between items-center mt-4">
          <button 
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="btn-secondary disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-white/70">Page {page + 1}</span>
          <button 
            onClick={() => setPage(p => p + 1)}
            disabled={payments.length < pageSize}
            className="btn-secondary disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

function MetricCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="metric-card">
      <div className="text-sm text-white/70 mb-2">{title}</div>
      <div className="text-2xl font-bold text-white">{value}</div>
    </div>
  )
}

// Render
const container = document.getElementById('root')
if (container) {
  const root = createRoot(container)
  root.render(<App />)
}