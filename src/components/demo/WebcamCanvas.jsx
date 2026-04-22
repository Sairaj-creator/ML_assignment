import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react'

const WebcamCanvas = forwardRef(function WebcamCanvas(
  { videoRef, isActive, label, mirrored = false, isOutput = false },
  ref
) {
  const canvasRef = useRef(null)

  useImperativeHandle(ref, () => canvasRef.current)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-400 animate-pulse' : 'bg-gray-600'}`} />
          <span className="text-sm font-medium text-gray-300">{label}</span>
        </div>
        {isOutput && isActive && (
          <div className="flex items-center gap-1.5 text-xs text-cyan-400">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            Privacy masked
          </div>
        )}
      </div>

      <div className="relative bg-gray-900 border border-gray-700 rounded-2xl overflow-hidden aspect-video w-full">
        {/* Video element (raw feed) */}
        {!isOutput && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`absolute inset-0 w-full h-full object-cover ${mirrored ? 'scale-x-[-1]' : ''} ${isActive ? 'opacity-100' : 'opacity-0'}`}
          />
        )}

        {/* Canvas (masked output) */}
        {isOutput && (
          <canvas
            ref={canvasRef}
            width={640}
            height={480}
            className={`absolute inset-0 w-full h-full object-cover ${isActive ? 'opacity-100' : 'opacity-0'}`}
          />
        )}

        {/* Placeholder when not active */}
        {!isActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-gray-600">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              {isOutput
                ? <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                : <><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></>
              }
            </svg>
            <span className="text-sm">{isOutput ? 'Masked output' : 'Camera inactive'}</span>
          </div>
        )}
      </div>
    </div>
  )
})

export default WebcamCanvas
