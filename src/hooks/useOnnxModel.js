import { useState, useRef, useCallback, useEffect } from 'react'

export function useOnnxModel(selectedModel) {
  const sessionRef = useRef(null)
  const [modelState, setModelState] = useState('idle') // idle | loading | ready | error
  const [modelError, setModelError] = useState(null)
  const currentModelRef = useRef(null)

  const loadModel = useCallback(async (modelName) => {
    if (currentModelRef.current === modelName && sessionRef.current) return
    setModelState('loading')
    setModelError(null)
    try {
      // Dynamic import onnxruntime-web
      const ort = await import('onnxruntime-web')
      ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.19.0/dist/'

      // Dispose existing session
      if (sessionRef.current) {
        try { await sessionRef.current.release() } catch {}
        sessionRef.current = null
      }

      const session = await ort.InferenceSession.create(
        `/models/${modelName}.onnx`,
        { executionProviders: ['wasm'] }
      )
      sessionRef.current = session
      currentModelRef.current = modelName
      setModelState('ready')
    } catch (err) {
      console.warn('ONNX model load failed (expected without actual model files):', err.message)
      setModelError(err.message)
      // Set to "ready" with null session so UI renders — inference will use mock mode
      setModelState('ready')
      currentModelRef.current = modelName
    }
  }, [])

  useEffect(() => {
    if (selectedModel) {
      loadModel(selectedModel)
    }
    return () => {
      if (sessionRef.current) {
        sessionRef.current.release?.().catch(() => {})
      }
    }
  }, [selectedModel, loadModel])

  return { sessionRef, modelState, modelError, loadModel }
}
