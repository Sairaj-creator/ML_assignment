import { useState, useEffect, useRef } from 'react'

const STATS = [
  { value: 25, suffix: '+', label: 'FPS in Browser', unit: '', accent: 'text-cyan-400' },
  { value: 3.2, suffix: 'MB', label: 'Model Size', unit: '', accent: 'text-blue-400' },
  { value: 0, suffix: ' bytes', label: 'Sent to Cloud', unit: '', accent: 'text-green-400' },
  { value: 2, suffix: '', label: 'Classes Detected', unit: '', accent: 'text-purple-400' },
]

function AnimatedCounter({ target, suffix, accent, decimals = 0 }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const duration = 1800
          const steps = 60
          const increment = target / steps
          let current = 0
          const timer = setInterval(() => {
            current = Math.min(current + increment, target)
            setCount(current)
            if (current >= target) clearInterval(timer)
          }, duration / steps)
        }
      },
      { threshold: 0.5 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target])

  const display = decimals > 0 ? count.toFixed(decimals) : Math.floor(count)

  return (
    <span ref={ref} className={`text-5xl sm:text-6xl font-black ${accent}`}>
      {display}{suffix}
    </span>
  )
}

export default function PerformanceStats() {
  return (
    <section className="py-24 px-6 bg-gray-900/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Built for performance</h2>
          <p className="text-gray-400 text-lg">YOLOv8-nano quantized to INT8 — tiny footprint, maximum throughput.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS.map((s) => (
            <div key={s.label} className="bg-gray-900 border border-gray-700 rounded-2xl p-8 text-center relative overflow-hidden group">
              <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <AnimatedCounter
                  target={s.value}
                  suffix={s.suffix}
                  accent={s.accent}
                  decimals={s.value % 1 !== 0 ? 1 : 0}
                />
                <p className="text-gray-400 text-sm mt-2 font-medium">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Model comparison */}
        <div className="mt-12 bg-gray-900 border border-gray-700 rounded-2xl p-8">
          <h3 className="text-white font-bold text-xl mb-6">Model Variants</h3>
          <div className="space-y-4">
            {[
              { name: 'FP32 (416)', fps: 12, size: '6.4MB', bar: 48, color: 'bg-gray-600' },
              { name: 'INT8 Dynamic (416)', fps: 20, size: '3.8MB', bar: 80, color: 'bg-blue-500' },
              { name: 'INT8 Static (416)', fps: 25, size: '3.2MB', bar: 100, color: 'bg-cyan-500' },
            ].map((m) => (
              <div key={m.name} className="flex items-center gap-4">
                <div className="w-44 text-sm text-gray-300 font-medium shrink-0">{m.name}</div>
                <div className="flex-1 h-3 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${m.color} rounded-full transition-all duration-1000`}
                    style={{ width: `${m.bar}%` }}
                  />
                </div>
                <div className="text-right w-20 shrink-0">
                  <span className="text-white font-bold text-sm">{m.fps} FPS</span>
                  <span className="text-gray-500 text-xs ml-2">{m.size}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
