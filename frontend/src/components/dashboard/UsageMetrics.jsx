const TILES = [
  { key: 'total_sessions', label: 'Total Sessions', icon: '📹', color: 'text-cyan-400' },
  { key: 'total_frames', label: 'Frames Processed', icon: '🎞', color: 'text-blue-400' },
  { key: 'avg_fps', label: 'Avg FPS', icon: '⚡', color: 'text-amber-400', suffix: '' },
  { key: 'total_detections', label: 'Total Detections', icon: '🎯', color: 'text-green-400' },
]

export default function UsageMetrics({ stats }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {TILES.map(({ key, label, icon, color, suffix }) => (
        <div key={key} className="bg-gray-900 border border-gray-700 rounded-2xl p-5 relative overflow-hidden group">
          <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10">
            <div className="text-2xl mb-2">{icon}</div>
            <div className={`text-3xl font-black ${color} font-mono`}>
              {stats?.[key]?.toLocaleString() ?? '—'}{suffix}
            </div>
            <div className="text-gray-500 text-xs mt-1.5 font-medium uppercase tracking-wider">{label}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
