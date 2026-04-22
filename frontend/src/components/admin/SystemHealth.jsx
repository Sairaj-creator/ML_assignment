const METRICS = [
  { label: 'API Status', value: 'Online', color: 'text-green-400', icon: '✅' },
  { label: 'P95 Latency', value: '71 ms', color: 'text-cyan-400', icon: '⏱' },
  { label: 'Error Rate', value: '0.12%', color: 'text-amber-400', icon: '⚠' },
  { label: 'Uptime', value: '99.97%', color: 'text-blue-400', icon: '🔄' },
]

export default function SystemHealth({ health }) {
  const data = health || {}
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {METRICS.map(({ label, value, color, icon }) => (
        <div key={label} className="bg-gray-800 rounded-xl p-4 text-center border border-gray-700">
          <div className="text-2xl mb-1">{icon}</div>
          <div className={`text-xl font-bold ${color}`}>{data[label] || value}</div>
          <div className="text-gray-500 text-xs mt-1 uppercase tracking-wider">{label}</div>
        </div>
      ))}
    </div>
  )
}
