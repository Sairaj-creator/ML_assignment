import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { getUserStats } from '../../api/statsApi.js'
import UsageMetrics from '../../components/dashboard/UsageMetrics.jsx'
import SessionHistoryTable from '../../components/dashboard/SessionHistoryTable.jsx'
import FPSLineChart from '../../components/dashboard/FPSLineChart.jsx'
import DetectionsPieChart from '../../components/dashboard/DetectionsPieChart.jsx'
import { downloadCSV } from '../../utils/imageUtils.js'

const MOCK_STATS = {
  total_sessions: 47,
  total_frames: 128_430,
  avg_fps: 22.4,
  total_detections: 3_891,
}

const MOCK_SESSIONS = Array.from({ length: 10 }, (_, i) => ({
  date: new Date(Date.now() - i * 86400000 * (Math.random() + 0.5)).toLocaleDateString(),
  duration_s: Math.round(120 + Math.random() * 300),
  frames: Math.round(1800 + Math.random() * 4000),
  avg_fps: +(18 + Math.random() * 8).toFixed(1),
  detections: Math.round(40 + Math.random() * 120),
  model: ['int8_static_416', 'int8_dynamic_416', 'fp32_416'][Math.floor(Math.random() * 3)],
}))

const MOCK_FPS_DATA = Array.from({ length: 7 }, (_, i) => {
  const d = new Date()
  d.setDate(d.getDate() - (6 - i))
  return { date: d.toLocaleDateString('en', { weekday: 'short' }), fps: +(16 + Math.random() * 10).toFixed(1) }
})

const MOCK_PIE = [
  { name: 'Faces', value: 2340 },
  { name: 'License Plates', value: 1551 },
]

export default function UserDashboardPage() {
  const { token, user } = useAuth()
  const [stats, setStats] = useState(null)
  const [sessions, setSessions] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const data = await getUserStats(token)
        if (active) {
          setStats(data.stats || MOCK_STATS)
          setSessions(data.sessions || MOCK_SESSIONS)
        }
      } catch {
        if (active) { setStats(MOCK_STATS); setSessions(MOCK_SESSIONS) }
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [token])

  const handleExportCSV = () => {
    downloadCSV(sessions || [], `session_history_${Date.now()}.csv`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-8 page-transition">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-black text-white">
              Welcome back, <span className="text-cyan-400">{user?.fullName?.split(' ')[0] || 'User'}</span> 👋
            </h1>
            <p className="text-gray-400 text-sm mt-1">Your privacy masking activity at a glance</p>
          </div>
          <button
            id="export-csv-btn"
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white rounded-xl text-sm transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
            </svg>
            Export CSV
          </button>
        </div>

        {/* KPI tiles */}
        <UsageMetrics stats={stats} />

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
            <FPSLineChart data={MOCK_FPS_DATA} />
          </div>
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
            <DetectionsPieChart data={MOCK_PIE} />
          </div>
        </div>

        {/* Session history */}
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider">Session History</h2>
            <span className="text-xs text-gray-500">{sessions?.length || 0} sessions</span>
          </div>
          <SessionHistoryTable sessions={sessions || []} />
        </div>
      </div>
    </div>
  )
}
