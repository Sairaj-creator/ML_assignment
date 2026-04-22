const CLASS_COLORS = { face: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30', license_plate: 'bg-amber-500/20 text-amber-400 border-amber-500/30' }

export default function DetectionsList({ detections }) {
  if (!detections.length) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm">
        <svg className="w-8 h-8 mx-auto mb-2 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
        </svg>
        No detections found
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-300">{detections.length} detection{detections.length !== 1 ? 's' : ''} found</p>
      </div>
      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
        {detections.map((d, i) => (
          <div key={i} className="flex items-center justify-between bg-gray-800 rounded-xl px-4 py-3">
            <div className="flex items-center gap-3">
              <span className={`text-xs px-2.5 py-1 rounded-full border font-medium capitalize ${CLASS_COLORS[d.class_name] || 'bg-gray-700 text-gray-300 border-gray-600'}`}>
                {d.class_name?.replace('_', ' ')}
              </span>
              <span className="text-xs text-gray-500 font-mono">
                [{Math.round(d.bbox?.[0])}, {Math.round(d.bbox?.[1])}, {Math.round(d.bbox?.[2])}, {Math.round(d.bbox?.[3])}]
              </span>
            </div>
            <span className="text-sm font-bold text-white">{(d.confidence * 100).toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
