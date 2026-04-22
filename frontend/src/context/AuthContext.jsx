import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('edge_ai_token')
    const storedUser = localStorage.getItem('edge_ai_user')
    if (storedToken && storedUser) {
      try {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
      } catch {
        localStorage.removeItem('edge_ai_token')
        localStorage.removeItem('edge_ai_user')
      }
    }
    setLoading(false)
  }, [])

  const login = useCallback((newToken, newUser, remember = true) => {
    setToken(newToken)
    setUser(newUser)
    if (remember) {
      localStorage.setItem('edge_ai_token', newToken)
      localStorage.setItem('edge_ai_user', JSON.stringify(newUser))
    } else {
      sessionStorage.setItem('edge_ai_token', newToken)
      sessionStorage.setItem('edge_ai_user', JSON.stringify(newUser))
    }
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('edge_ai_token')
    localStorage.removeItem('edge_ai_user')
    sessionStorage.removeItem('edge_ai_token')
    sessionStorage.removeItem('edge_ai_user')
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
