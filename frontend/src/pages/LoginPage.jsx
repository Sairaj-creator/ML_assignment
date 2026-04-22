import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import AuthForm from '../components/auth/AuthForm.jsx'
import { login as loginApi } from '../api/authApi.js'
import { validateEmail, validatePassword } from '../utils/validators.js'

const MOCK_USER = { id: '1', email: 'demo@edgeai.com', fullName: 'Demo User', role: 'user' }
const MOCK_ADMIN = { id: '2', email: 'admin@edgeai.com', fullName: 'Admin User', role: 'admin' }

const LOGIN_FIELDS = [
  {
    name: 'email',
    label: 'Email address',
    type: 'email',
    placeholder: 'you@example.com',
    autoComplete: 'email',
    validate: validateEmail,
  },
  {
    name: 'password',
    label: 'Password',
    type: 'password',
    placeholder: '••••••••',
    autoComplete: 'current-password',
    validate: (v) => (!v ? 'Password is required.' : null),
  },
  {
    name: 'rememberMe',
    label: 'Remember me for 30 days',
    type: 'checkbox',
    defaultValue: true,
  },
]

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async ({ email, password, rememberMe }) => {
    setLoading(true)
    setError(null)
    try {
      // Try real API first, fall back to mock
      try {
        const data = await loginApi({ email, password })
        login(data.access_token, data.user, rememberMe)
      } catch {
        // Mock login for demo
        if (email === 'admin@edgeai.com') {
          login('mock_admin_token_xyz', MOCK_ADMIN, rememberMe)
        } else {
          login('mock_user_token_xyz', { ...MOCK_USER, email, fullName: email.split('@')[0] }, rememberMe)
        }
      }
      navigate('/app/demo')
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-12 page-transition">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-cyan-500/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
          </Link>
          <h1 className="text-3xl font-black text-white">Welcome back</h1>
          <p className="text-gray-400 mt-2 text-sm">Sign in to your Edge-AI account</p>
        </div>

        {/* Card */}
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8">
          <AuthForm
            fields={LOGIN_FIELDS}
            onSubmit={handleSubmit}
            submitLabel="Sign in →"
            loading={loading}
            error={error}
            linkNode={
              <span>
                Don't have an account?{' '}
                <Link to="/signup" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
                  Sign up free
                </Link>
              </span>
            }
          />
        </div>

        {/* Demo credentials hint */}
        <div className="mt-4 bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-xs text-gray-400">
          <p className="font-medium text-gray-300 mb-1">Demo credentials</p>
          <p>User: <code className="text-cyan-400">demo@edgeai.com</code> / any password</p>
          <p>Admin: <code className="text-purple-400">admin@edgeai.com</code> / any password</p>
        </div>
      </div>
    </div>
  )
}
