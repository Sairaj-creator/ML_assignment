import { useState, useRef } from 'react'
import { useApp } from '../../context/AppContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { predict } from '../../api/predictApi.js'
import DropZone from '../../components/upload/DropZone.jsx'
import BeforeAfterViewer from '../../components/upload/BeforeAfterViewer.jsx'
import DetectionsList from '../../components/upload/DetectionsList.jsx'
import DownloadButton from '../../components/upload/DownloadButton.jsx'
import { loadImageFromFile, drawImageToCanvas, applyBlurToDetections, canvasToBase64 } from '../../utils/imageUtils.js'
import { getMockDetections } from '../../utils/inference.js'

function generateMockResult(imageUrl) {
  // Create mock detections based on image dimensions
  const mockDets = [
    { class_name: 'face', confidence: 0.92, bbox: [120, 60, 280, 210] },
    { class_name: 'license_plate', confidence: 0.81, bbox: [310, 280, 490, 330] },
  ]
  return mockDets
}

export default function UploadPage() {
  const { token } = useAuth()
  const { blurStrength, confThreshold, selectedModel } = useApp()
  const [file, setFile] = useState(null)
  const [originalSrc, setOriginalSrc] = useState(null)
  const [maskedSrc, setMaskedSrc] = useState(null)
  const [maskedBase64, setMaskedBase64] = useState(null)
  const [detections, setDetections] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [returnOriginal, setReturnOriginal] = useState(false)
  const [localBlur, setLocalBlur] = useState(blurStrength)
  const canvasRef = useRef(null)

  const handleFile = async (f) => {
    setFile(f)
    setMaskedSrc(null)
    setDetections([])
    setError(null)
    const url = URL.createObjectURL(f)
    setOriginalSrc(url)
  }

  const handleProcess = async () => {
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      // Convert file to base64
      const arrayBuffer = await file.arrayBuffer()
      const uint8 = new Uint8Array(arrayBuffer)
      let binary = ''
      uint8.forEach((b) => (binary += String.fromCharCode(b)))
      const b64 = btoa(binary)

      let dets = []
      let resultB64 = null

      try {
        const result = await predict({
          image_b64: b64,
          blur_strength: localBlur,
          confidence_threshold: confThreshold,
          model_variant: selectedModel,
          return_blurred: !returnOriginal,
        }, token)
        dets = result.detections || []
        resultB64 = result.masked_image_b64 || result.image_b64
      } catch {
        // Mock: apply blur locally
        const img = await loadImageFromFile(file)
        if (!canvasRef.current) canvasRef.current = document.createElement('canvas')
        const ctx = drawImageToCanvas(canvasRef.current, img)
        const mockDets = generateMockResult().map((d) => ({
          ...d,
          x1: d.bbox[0], y1: d.bbox[1], x2: d.bbox[2], y2: d.bbox[3],
        }))
        applyBlurToDetections(ctx, img, mockDets, localBlur, true)
        resultB64 = canvasToBase64(canvasRef.current)
        dets = generateMockResult()
      }

      setDetections(dets)
      if (resultB64) {
        const dataUrl = `data:image/jpeg;base64,${resultB64}`
        setMaskedSrc(dataUrl)
        setMaskedBase64(resultB64)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFile(null)
    setOriginalSrc(null)
    setMaskedSrc(null)
    setMaskedBase64(null)
    setDetections([])
    setError(null)
  }

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-8 page-transition">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
              </svg>
            </div>
            Upload & Blur
          </h1>
          <p className="text-gray-400 text-sm mt-1">Upload an image to detect and blur PII automatically</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Controls */}
          <div className="space-y-5">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 space-y-5">
              <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider">Settings</h2>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Blur Strength</label>
                  <span className="text-cyan-400 text-sm font-bold font-mono">{localBlur}px</span>
                </div>
                <input
                  type="range" min={3} max={101} step={2} value={localBlur}
                  onChange={(e) => setLocalBlur(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Return Original</p>
                  <p className="text-xs text-gray-600 mt-0.5">Skip masking, just detect</p>
                </div>
                <button
                  type="button"
                  onClick={() => setReturnOriginal((v) => !v)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${returnOriginal ? 'bg-cyan-600' : 'bg-gray-700'}`}
                >
                  <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${returnOriginal ? 'translate-x-5' : ''}`} />
                </button>
              </div>

              <button
                id="process-image-btn"
                onClick={handleProcess}
                disabled={!file || loading}
                className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-semibold rounded-xl px-6 py-3 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
                ) : (
                  <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> Process Image</>
                )}
              </button>

              {file && (
                <button onClick={handleReset} className="w-full text-sm text-gray-500 hover:text-gray-300 transition-colors">
                  Reset
                </button>
              )}
            </div>

            {/* Detections */}
            {detections.length > 0 && (
              <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
                <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4">Detections</h2>
                <DetectionsList detections={detections} />
              </div>
            )}

            {/* Download */}
            {maskedBase64 && (
              <DownloadButton maskedBase64={maskedBase64} filename={`masked_${file?.name || 'output.jpg'}`} />
            )}
          </div>

          {/* Right: Upload + viewer */}
          <div className="lg:col-span-2 space-y-5">
            {!file && <DropZone onFile={handleFile} />}

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            {originalSrc && !maskedSrc && (
              <div>
                <p className="text-sm text-gray-400 mb-3">Preview: <span className="text-white">{file?.name}</span></p>
                <div className="rounded-2xl overflow-hidden border border-gray-700 bg-gray-900">
                  <img src={originalSrc} alt="Selected" className="w-full object-contain max-h-96" />
                </div>
              </div>
            )}

            {originalSrc && maskedSrc && (
              <BeforeAfterViewer originalSrc={originalSrc} maskedSrc={maskedSrc} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
