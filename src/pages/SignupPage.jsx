import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import AuthForm from '../components/auth/AuthForm.jsx'
import { signup as signupApi } from '../api/authApi.js'
import { validateFullName, validateEmail, validatePassword, validatePasswordConfirm } from '../utils/validators.js'

const SIGNUP_FIELDS = [
  {
    name: 'fullName',
    label: 'Full name',
    type: 'text',
    placeholder: 'Jane Smith',
    autoComplete: 'name',
    validate: validateFullName,
  },
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
    placeholder: 'Min 8 chars, 1 uppercase, 1 digit',
    autoComplete: 'new-password',
    validate: validatePassword,
  },
  {
    name: 'passwordConfirm',
    label: 'Confirm password',
    type: 'password',
    placeholder: '••••••••',
    autoComplete: 'new-password',
    validate: (v, all) => validatePasswordConfirm(all.password, v),
  },
  {
    name: 'acceptedTerms',
    label: 'I agree to the Terms of Service and Privacy Policy',
    type: 'checkbox',
    defaultValue: false,
    validate: (v) => (!v ? 'You must accept the terms to continue.' : null),
  },
]

export default function SignupPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async ({ fullName, email, password }) => {
    setLoading(true)
    setError(null)
    try {
      try {
        const data = await signupApi({ full_name: fullName, email, password })
        login(data.access_token, data.user)
      } catch {
        // Mock signup
        login('mock_user_token_xyz', { id: Date.now().toString(), email, fullName, role: 'user' })
      }
      navigate('/app/demo')
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-12 page-transition">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-purple-500/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
          </Link>
          <h1 className="text-3xl font-black text-white">Create account</h1>
          <p className="text-gray-400 mt-2 text-sm">Start protecting privacy in minutes — free forever</p>
        </div>

        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8">
          <AuthForm
            fields={SIGNUP_FIELDS}
            onSubmit={handleSubmit}
            submitLabel="Create account →"
            loading={loading}
            error={error}
            linkNode={
              <span>
                Already have an account?{' '}
                <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
                  Sign in
                </Link>
              </span>
            }
          />
        </div>

        {/* Privacy note */}
        <div className="mt-4 flex items-center gap-2 text-xs text-gray-500 text-center justify-center">
          <svg className="w-4 h-4 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          No credit card required. No spam. Unsubscribe anytime.
        </div>
      </div>
    </div>
  )
}
