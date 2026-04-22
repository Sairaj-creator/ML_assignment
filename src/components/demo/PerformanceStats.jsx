const TILE_CONFIG = [
  { key: 'fps', label: 'FPS', icon: '⚡', color: 'text-cyan-400', format: (v) => v.toFixed(1) },
  { key: 'latency', label: 'Latency', icon: '⏱', color: 'text-blue-400', format: (v) => `${v.toFixed(0)}ms` },
  { key: 'detections', label: 'Detections', icon: '🎯', color: 'text-amber-400', format: (v) => v },
  { key: 'uptime', label: 'Uptime', icon: '🕐', color: 'text-green-400', format: (v) => v },
]

export default function PerformanceStats({ fps, latency, detections, uptime }) {
  const values = { fps, latency, detections, uptime }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {TILE_CONFIG.map(({ key, label, icon, color, format }) => (
        <div key={key} className="bg-gray-900 border border-gray-700 rounded-xl p-4 text-center relative overflow-hidden group">
          <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10">
            <div className="text-lg mb-1">{icon}</div>
            <div className={`text-2xl font-black ${color} font-mono`}>
              {format(values[key] ?? (key === 'uptime' ? '00:00:00' : 0))}
            </div>
            <div className="text-gray-500 text-xs mt-1 font-medium uppercase tracking-wider">{label}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
