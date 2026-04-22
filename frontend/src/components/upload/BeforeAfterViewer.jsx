import { useState, useRef } from 'react'

export default function BeforeAfterViewer({ originalSrc, maskedSrc }) {
  const [sliderX, setSliderX] = useState(50)
  const containerRef = useRef(null)

  const handleMove = (clientX) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const pct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100))
    setSliderX(pct)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">Before / After Comparison</span>
        <span className="text-cyan-400 font-mono text-xs">{sliderX.toFixed(0)}%</span>
      </div>

      <div
        ref={containerRef}
        className="relative rounded-2xl overflow-hidden border border-gray-700 select-none cursor-ew-resize"
        style={{ aspectRatio: '16/9' }}
        onMouseMove={(e) => { if (e.buttons === 1) handleMove(e.clientX) }}
        onMouseDown={(e) => handleMove(e.clientX)}
        onTouchMove={(e) => handleMove(e.touches[0].clientX)}
      >
        {/* Original image (full width) */}
        <img
          src={originalSrc}
          alt="Original"
          className="absolute inset-0 w-full h-full object-contain bg-gray-900"
          draggable={false}
        />

        {/* Masked image (clipped to slider position) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - sliderX}% 0 0)` }}
        >
          <img
            src={maskedSrc}
            alt="Masked"
            className="absolute inset-0 w-full h-full object-contain bg-gray-900"
            draggable={false}
          />
        </div>

        {/* Slider handle */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg"
          style={{ left: `${sliderX}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full shadow-xl flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1f2937" strokeWidth="2.5">
              <path d="M7 16l-4-4 4-4M17 8l4 4-4 4"/>
            </svg>
          </div>
        </div>

        {/* Labels */}
        <div className="absolute top-3 left-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">Original</div>
        <div className="absolute top-3 right-3 bg-cyan-600/80 text-white text-xs px-2 py-1 rounded-full">Masked</div>
      </div>
    </div>
  )
}
