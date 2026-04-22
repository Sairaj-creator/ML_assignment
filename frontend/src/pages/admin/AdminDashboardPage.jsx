import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { getAdminStats } from '../../api/statsApi.js'
import SystemHealth from '../../components/admin/SystemHealth.jsx'
import UserTable from '../../components/admin/UserTable.jsx'
import ModelLoadStats from '../../components/admin/ModelLoadStats.jsx'

const MOCK_USERS = Array.from({ length: 8 }, (_, i) => ({
  id: `usr_${(i + 1).toString().padStart(4, '0')}`,
  email: [`alice@corp.com`, `bob@startup.io`, `carol@bigco.com`, `dave@uni.edu`, `eve@lab.io`, `frank@dev.co`, `grace@ai.com`, `henry@ml.io`][i],
  total_sessions: Math.round(5 + Math.random() * 80),
  total_frames: Math.round(5000 + Math.random() * 200000),
  last_active: new Date(Date.now() - Math.random() * 86400000 * 10).toLocaleDateString(),
}))

const MOCK_MODEL_DATA = [
  { key: 'fp32_416', name: 'FP32', uses: 23 },
  { key: 'int8_dynamic_416', name: 'INT8 Dyn', uses: 58 },
  { key: 'int8_static_416', name: 'INT8 Sta', uses: 147 },
]

const MOCK_HEALTH = {
  api_status: 'Online',
  p95_latency_ms: 71,
  error_rate: '0.12%',
  uptime_pct: '99.97%',
}

export default function AdminDashboardPage() {
  const { token } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const res = await getAdminStats(token)
        if (active) setData(res)
      } catch {
        if (active) setData({ users: MOCK_USERS, health: MOCK_HEALTH, model_stats: MOCK_MODEL_DATA })
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [token])

  const users = data?.users || MOCK_USERS
  const modelStats = data?.model_stats || MOCK_MODEL_DATA
  const health = data?.health || MOCK_HEALTH

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const totalFrames = users.reduce((s, u) => s + (u.total_frames || 0), 0)
  const totalSessions = users.reduce((s, u) => s + (u.total_sessions || 0), 0)

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-8 page-transition">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75M9 7a4 4 0 110 8 4 4 0 010-8z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Admin Dashboard</h1>
            <p className="text-gray-400 text-sm mt-0.5">System overview and user management</p>
          </div>
          <div className="ml-auto px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-medium">
            🔒 Admin Only
          </div>
        </div>

        {/* Summary tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Users', value: users.length, color: 'text-purple-400' },
            { label: 'Total Sessions', value: totalSessions.toLocaleString(), color: 'text-cyan-400' },
            { label: 'Total Frames', value: (totalFrames / 1000).toFixed(0) + 'K', color: 'text-blue-400' },
            { label: 'Active Models', value: 3, color: 'text-amber-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-gray-900 border border-gray-700 rounded-2xl p-5">
              <div className={`text-3xl font-black ${color} font-mono`}>{value}</div>
              <div className="text-gray-500 text-xs mt-2 uppercase tracking-wider">{label}</div>
            </div>
          ))}
        </div>

        {/* System health */}
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
          <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-5">System Health</h2>
          <SystemHealth health={health} />
        </div>

        {/* Users + Model stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-gray-900 border border-gray-700 rounded-2xl p-6">
            <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-5">
              Users <span className="text-gray-600 font-normal normal-case text-xs">({users.length})</span>
            </h2>
            <UserTable users={users} />
          </div>

          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
            <ModelLoadStats data={modelStats} />
          </div>
        </div>
      </div>
    </div>
  )
}
