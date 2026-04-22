import { createContext, useContext, useReducer } from 'react'

const AppContext = createContext(null)

const initialState = {
  selectedModel: 'int8_static_416',
  inferenceMode: 'browser',
  blurStrength: 51,
  confThreshold: 0.40,
  showBoxes: false,
}

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_MODEL': return { ...state, selectedModel: action.payload }
    case 'SET_INFERENCE_MODE': return { ...state, inferenceMode: action.payload }
    case 'SET_BLUR_STRENGTH': return { ...state, blurStrength: action.payload }
    case 'SET_CONF_THRESHOLD': return { ...state, confThreshold: action.payload }
    case 'SET_SHOW_BOXES': return { ...state, showBoxes: action.payload }
    default: return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  const setSelectedModel = (v) => dispatch({ type: 'SET_MODEL', payload: v })
  const setInferenceMode = (v) => dispatch({ type: 'SET_INFERENCE_MODE', payload: v })
  const setBlurStrength = (v) => dispatch({ type: 'SET_BLUR_STRENGTH', payload: v })
  const setConfThreshold = (v) => dispatch({ type: 'SET_CONF_THRESHOLD', payload: v })
  const setShowBoxes = (v) => dispatch({ type: 'SET_SHOW_BOXES', payload: v })

  return (
    <AppContext.Provider value={{
      ...state,
      setSelectedModel,
      setInferenceMode,
      setBlurStrength,
      setConfThreshold,
      setShowBoxes,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
