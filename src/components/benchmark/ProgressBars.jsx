import { useEffect, useState } from 'react'

export default function ProgressBars({ running, results }) {
  const models = [
    { key: 'fp32_416', label: 'FP32 (416)', color: 'bg-gray-400' },
    { key: 'int8_dynamic_416', label: 'INT8 Dynamic (416)', color: 'bg-blue-500' },
    { key: 'int8_static_416', label: 'INT8 Static (416)', color: 'bg-cyan-500' },
  ]

  const [progress, setProgress] = useState({ fp32_416: 0, int8_dynamic_416: 0, int8_static_416: 0 })

  useEffect(() => {
    if (!running) {
      if (results) {
        setProgress({ fp32_416: 100, int8_dynamic_416: 100, int8_static_416: 100 })
      }
      return
    }
    setProgress({ fp32_416: 0, int8_dynamic_416: 0, int8_static_416: 0 })
    const delays = { fp32_416: 0, int8_dynamic_416: 800, int8_static_416: 1600 }
    const timers = []

    Object.entries(delays).forEach(([key, delay]) => {
      const start = Date.now() + delay
      const duration = 4000
      timers.push(setInterval(() => {
        const elapsed = Date.now() - start
        if (elapsed < 0) return
        const pct = Math.min(100, (elapsed / duration) * 100)
        setProgress((prev) => ({ ...prev, [key]: pct }))
      }, 50))
    })
    return () => timers.forEach(clearInterval)
  }, [running, results])

  return (
    <div className="space-y-4">
      {models.map((m) => (
        <div key={m.key}>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-gray-300 font-medium">{m.label}</span>
            <span className="text-gray-400 font-mono">{Math.round(progress[m.key])}%</span>
          </div>
          <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full ${m.color} rounded-full transition-all duration-100`}
              style={{ width: `${progress[m.key]}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
