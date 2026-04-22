import { useRef, useCallback } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { logSession } from '../api/sessionApi.js'

export function useSessionLogger(sessionIdRef) {
  const { token } = useAuth()
  const intervalRef = useRef(null)
  const statsRef = useRef({ frames: 0, fpsSamples: [], latencySamples: [], detections: 0 })

  const updateStats = useCallback(({ fps, latency, detections }) => {
    statsRef.current.frames += 1
    if (fps) statsRef.current.fpsSamples.push(fps)
    if (latency) statsRef.current.latencySamples.push(latency)
    if (detections !== undefined) statsRef.current.detections += detections
  }, [])

  const startLogging = useCallback(() => {
    if (intervalRef.current) return
    statsRef.current = { frames: 0, fpsSamples: [], latencySamples: [], detections: 0 }
    intervalRef.current = setInterval(async () => {
      const { frames, fpsSamples, latencySamples, detections } = statsRef.current
      if (frames === 0 || !sessionIdRef.current) return
      const avg_fps = fpsSamples.length
        ? fpsSamples.reduce((a, b) => a + b, 0) / fpsSamples.length
        : 0
      const avg_latency_ms = latencySamples.length
        ? latencySamples.reduce((a, b) => a + b, 0) / latencySamples.length
        : 0
      try {
        await logSession({
          session_id: sessionIdRef.current,
          frames_processed: frames,
          avg_fps: Math.round(avg_fps * 10) / 10,
          avg_latency_ms: Math.round(avg_latency_ms * 10) / 10,
          detections_count: detections,
        }, token)
      } catch {
        // Silent — backend may not be running
      }
      statsRef.current = { frames: 0, fpsSamples: [], latencySamples: [], detections: 0 }
    }, 10000)
  }, [sessionIdRef, token])

  const stopLogging = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  return { updateStats, startLogging, stopLogging }
}
