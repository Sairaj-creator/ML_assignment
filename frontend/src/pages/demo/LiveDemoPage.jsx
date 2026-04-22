import { useEffect, useRef, useState, useCallback } from 'react'
import { useApp } from '../../context/AppContext.jsx'
import { useWebcam } from '../../hooks/useWebcam.js'
import { useOnnxModel } from '../../hooks/useOnnxModel.js'
import { useSessionLogger } from '../../hooks/useSessionLogger.js'
import WebcamCanvas from '../../components/demo/WebcamCanvas.jsx'
import ControlsPanel from '../../components/demo/ControlsPanel.jsx'
import ModelSelector from '../../components/demo/ModelSelector.jsx'
import InferenceModeToggle from '../../components/demo/InferenceModeToggle.jsx'
import PerfStats from '../../components/demo/PerformanceStats.jsx'
import SessionLogger from '../../components/demo/SessionLogger.jsx'
import { preprocessCanvas, decodeDetections, nms, getMockDetections } from '../../utils/inference.js'
import { applyBlurToDetections } from '../../utils/imageUtils.js'
import { useAuth } from '../../context/AuthContext.jsx'

export default function LiveDemoPage() {
  const { selectedModel, inferenceMode, blurStrength, confThreshold, showBoxes } = useApp()
  const { token } = useAuth()
  const { videoRef, isActive, error: camError, startWebcam, stopWebcam } = useWebcam()
  const { sessionRef: onnxSession, modelState } = useOnnxModel(selectedModel)

  const outputCanvasRef = useRef(null)
  const hiddenCanvasRef = useRef(null)
  const rafRef = useRef(null)
  const sessionIdRef = useRef(null)
  const startTimeRef = useRef(null)
  const frameCountRef = useRef(0)
  const fpsFramesRef = useRef([])

  const [fps, setFps] = useState(0)
  const [latency, setLatency] = useState(0)
  const [detections, setDetections] = useState(0)
  const [uptime, setUptime] = useState('00:00:00')
  const [logs, setLogs] = useState([])
  const [frameCount, setFrameCount] = useState(0)

  const sessionIdStateRef = useRef(null)
  const { updateStats, startLogging, stopLogging } = useSessionLogger(sessionIdStateRef)

  const addLog = useCallback((message, type = 'info') => {
    const now = new Date()
    const time = now.toTimeString().split(' ')[0]
    setLogs((prev) => [...prev.slice(-49), { time, message, type }])
  }, [])

  // Uptime ticker
  useEffect(() => {
    if (!isActive) return
    startTimeRef.current = Date.now()
    const ticker = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
      const h = String(Math.floor(elapsed / 3600)).padStart(2, '0')
      const m = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0')
      const s = String(elapsed % 60).padStart(2, '0')
      setUptime(`${h}:${m}:${s}`)
    }, 1000)
    return () => clearInterval(ticker)
  }, [isActive])

  // Main inference loop
  useEffect(() => {
    if (!isActive) return

    let lastFrameTime = 0
    const TARGET_FPS = 15
    const FRAME_INTERVAL = 1000 / TARGET_FPS
    let running = true

    // Create hidden canvas for preprocessing
    if (!hiddenCanvasRef.current) {
      hiddenCanvasRef.current = document.createElement('canvas')
      hiddenCanvasRef.current.width = 640
      hiddenCanvasRef.current.height = 480
    }
    const hiddenCtx = hiddenCanvasRef.current.getContext('2d')
    const outCanvas = outputCanvasRef.current
    if (!outCanvas) return
    const outCtx = outCanvas.getContext('2d')

    async function processFrame(timestamp) {
      if (!running) return
      rafRef.current = requestAnimationFrame(processFrame)

      if (timestamp - lastFrameTime < FRAME_INTERVAL) return
      const elapsed = timestamp - lastFrameTime
      lastFrameTime = timestamp

      const video = videoRef.current
      if (!video || video.readyState < 2) return

      const t0 = performance.now()

      // Draw video to hidden canvas
      hiddenCtx.save()
      hiddenCtx.scale(-1, 1)
      hiddenCtx.drawImage(video, -640, 0, 640, 480)
      hiddenCtx.restore()

      let dets = []

      if (inferenceMode === 'browser' && onnxSession.current) {
        try {
          const ort = await import('onnxruntime-web')
          const { float32, scale, padX, padY } = preprocessCanvas(hiddenCanvasRef.current)
          const tensor = new ort.Tensor('float32', float32, [1, 3, 416, 416])
          const results = await onnxSession.current.run({ images: tensor })
          const outputKey = Object.keys(results)[0]
          const outputData = results[outputKey].data
          const numDet = outputData.length / 6
          const rawDets = decodeDetections(outputData, numDet, 416, 416, 640, 480, scale, padX, padY, confThreshold)
          dets = nms(rawDets)
        } catch {
          // Fall back to mock
          dets = getMockDetections(frameCountRef.current)
        }
      } else {
        // No session — use animated mock detections
        dets = getMockDetections(frameCountRef.current)
      }

      // Render masked output
      outCanvas.width = 640
      outCanvas.height = 480
      applyBlurToDetections(outCtx, hiddenCanvasRef.current, dets, blurStrength, showBoxes)

      const latencyMs = performance.now() - t0
      frameCountRef.current += 1
      setFrameCount((c) => c + 1)
      setDetections(dets.length)
      setLatency(latencyMs)

      // FPS calculation (rolling 1s window)
      const now = performance.now()
      fpsFramesRef.current.push(now)
      fpsFramesRef.current = fpsFramesRef.current.filter((t) => now - t < 1000)
      const currentFps = fpsFramesRef.current.length
      setFps(currentFps)

      updateStats({ fps: currentFps, latency: latencyMs, detections: dets.length })
    }

    rafRef.current = requestAnimationFrame(processFrame)
    return () => {
      running = false
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [isActive, blurStrength, confThreshold, showBoxes, inferenceMode, videoRef, onnxSession, updateStats])

  const handleToggleCamera = async () => {
    if (isActive) {
      stopWebcam()
      stopLogging()
      sessionIdStateRef.current = null
      addLog('Camera stopped', 'info')
      setFps(0); setLatency(0); setDetections(0); setUptime('00:00:00')
    } else {
      addLog('Starting camera...', 'info')
      await startWebcam()
      sessionIdStateRef.current = `sess_${Date.now()}`
      startLogging()
      addLog(`Session ${sessionIdStateRef.current} started`, 'info')
      addLog(`Model: ${selectedModel} | Mode: ${inferenceMode}`, 'info')
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-8 page-transition">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2">
                  <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                </svg>
              </div>
              Live Privacy Demo
            </h1>
            <p className="text-gray-400 text-sm mt-1">Real-time PII detection and masking via YOLOv8-nano in WASM</p>
          </div>
          <div className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border ${
            isActive ? 'text-green-400 border-green-500/30 bg-green-500/10' : 'text-gray-500 border-gray-700'
          }`}>
            <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-400 animate-pulse' : 'bg-gray-600'}`} />
            {isActive ? 'Live' : 'Standby'}
          </div>
        </div>

        {camError && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
            </svg>
            Camera error: {camError}. Check permissions and try again.
          </div>
        )}

        {/* Dual canvas grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WebcamCanvas
            videoRef={videoRef}
            isActive={isActive}
            label="Raw Feed"
            mirrored
            isOutput={false}
          />
          <WebcamCanvas
            ref={outputCanvasRef}
            videoRef={videoRef}
            isActive={isActive}
            label="Privacy Masked"
            isOutput
          />
        </div>

        {/* Performance stats */}
        <PerfStats fps={fps} latency={latency} detections={detections} uptime={uptime} />

        {/* Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main controls */}
          <div className="lg:col-span-2 bg-gray-900 border border-gray-700 rounded-2xl p-6 space-y-6">
            <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider">Controls</h2>
            <ControlsPanel
              isActive={isActive}
              onToggleCamera={handleToggleCamera}
              modelState={modelState}
            />
          </div>

          {/* Model & mode */}
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 space-y-5">
            <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider">Inference Config</h2>
            <ModelSelector modelState={modelState} />
            <InferenceModeToggle />
          </div>
        </div>

        {/* Session logger */}
        <SessionLogger logs={logs} />

        {/* Info banner */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl px-5 py-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <div className="text-sm text-gray-400">
            <span className="text-cyan-400 font-medium">100% Private.</span>{' '}
            Your camera feed is processed entirely in your browser using WebAssembly.
            No frames are transmitted to any server. Detection is simulated when model files are absent.
          </div>
        </div>
      </div>
    </div>
  )
}
