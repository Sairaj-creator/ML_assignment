import { useApp } from '../../context/AppContext.jsx'

const MODELS = [
  { value: 'fp32_416', label: 'FP32 (416) — Highest accuracy', size: '6.4 MB', fps: '~12 FPS' },
  { value: 'int8_dynamic_416', label: 'INT8 Dynamic (416) — Balanced', size: '3.8 MB', fps: '~20 FPS' },
  { value: 'int8_static_416', label: 'INT8 Static (416) — Fastest ★', size: '3.2 MB', fps: '~25 FPS' },
]

export default function ModelSelector({ modelState }) {
  const { selectedModel, setSelectedModel } = useApp()

  return (
    <div>
      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Model</label>
      <div className="relative">
        <select
          id="model-selector"
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          disabled={modelState === 'loading'}
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-400 transition-colors appearance-none cursor-pointer disabled:opacity-50"
        >
          {MODELS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
        <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </div>

      {/* Selected model details */}
      {(() => {
        const m = MODELS.find((m) => m.value === selectedModel)
        return m ? (
          <div className="flex gap-4 mt-2 text-xs text-gray-500">
            <span>{m.size}</span>
            <span>·</span>
            <span>{m.fps}</span>
            {modelState === 'loading' && <span className="text-cyan-400 flex items-center gap-1">
              <div className="w-2.5 h-2.5 border border-cyan-400 border-t-transparent rounded-full animate-spin" />
              Loading...
            </span>}
            {modelState === 'ready' && <span className="text-green-400 flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-400" /> Ready
            </span>}
          </div>
        ) : null
      })()}
    </div>
  )
}
