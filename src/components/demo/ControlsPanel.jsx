import { useApp } from '../../context/AppContext.jsx'

export default function ControlsPanel({ isActive, onToggleCamera, modelState }) {
  const { blurStrength, setBlurStrength, confThreshold, setConfThreshold, showBoxes, setShowBoxes } = useApp()

  const cameraReady = modelState === 'ready' || modelState === 'idle'

  return (
    <div className="space-y-5">
      {/* Start/Stop Camera */}
      <div className="flex items-center gap-4">
        <button
          id="camera-toggle-btn"
          onClick={onToggleCamera}
          disabled={modelState === 'loading'}
          title={modelState === 'loading' ? 'Loading model (3.2MB)...' : undefined}
          className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${
            isActive
              ? 'bg-red-600 hover:bg-red-500 text-white'
              : 'bg-cyan-600 hover:bg-cyan-500 text-white glow-cyan-sm'
          }`}
        >
          {isActive ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
              Stop Camera
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
              {modelState === 'loading' ? 'Loading model...' : 'Start Camera'}
            </>
          )}
        </button>

        {isActive && (
          <div className="flex items-center gap-2 text-xs text-green-400">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Live feed active
          </div>
        )}
      </div>

      {/* Blur strength */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="blur-slider" className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Blur Strength
          </label>
          <span className="text-cyan-400 text-sm font-bold font-mono">{blurStrength}px</span>
        </div>
        <input
          id="blur-slider"
          type="range"
          min={3}
          max={101}
          step={2}
          value={blurStrength}
          onChange={(e) => setBlurStrength(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none bg-gray-700 cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-600 mt-1">
          <span>3px (subtle)</span>
          <span>101px (max)</span>
        </div>
      </div>

      {/* Confidence threshold */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="conf-slider" className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Confidence Threshold
          </label>
          <span className="text-cyan-400 text-sm font-bold font-mono">{(confThreshold * 100).toFixed(0)}%</span>
        </div>
        <input
          id="conf-slider"
          type="range"
          min={0.10}
          max={0.90}
          step={0.05}
          value={confThreshold}
          onChange={(e) => setConfThreshold(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none bg-gray-700 cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-600 mt-1">
          <span>10% (permissive)</span>
          <span>90% (strict)</span>
        </div>
      </div>

      {/* Show boxes */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Show Bounding Boxes</p>
          <p className="text-xs text-gray-600 mt-0.5">Draw detection outlines on masked output</p>
        </div>
        <button
          id="show-boxes-toggle"
          type="button"
          onClick={() => setShowBoxes(!showBoxes)}
          className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${showBoxes ? 'bg-cyan-600' : 'bg-gray-700'}`}
        >
          <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${showBoxes ? 'translate-x-5' : ''}`} />
        </button>
      </div>
    </div>
  )
}
