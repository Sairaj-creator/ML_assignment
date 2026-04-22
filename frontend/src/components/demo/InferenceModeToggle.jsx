import { useApp } from '../../context/AppContext.jsx'

export default function InferenceModeToggle() {
  const { inferenceMode, setInferenceMode } = useApp()

  const options = [
    { value: 'browser', label: 'In-Browser (WASM)', icon: '🧠', desc: 'Runs locally, zero latency' },
    { value: 'backend', label: 'Backend API', icon: '☁️', desc: 'Requires running server' },
  ]

  return (
    <div>
      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Inference Mode</label>
      <div className="flex gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            id={`inference-mode-${opt.value}`}
            type="button"
            onClick={() => setInferenceMode(opt.value)}
            className={`flex-1 flex flex-col items-center gap-1 px-3 py-2.5 rounded-lg border text-xs font-medium transition-all duration-200 ${
              inferenceMode === opt.value
                ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400'
                : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-300'
            }`}
          >
            <span className="text-base">{opt.icon}</span>
            <span>{opt.label}</span>
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-600 mt-1.5">
        {options.find((o) => o.value === inferenceMode)?.desc}
      </p>
    </div>
  )
}
