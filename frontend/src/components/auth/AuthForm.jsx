import { useState } from 'react'

export default function AuthForm({ fields, onSubmit, submitLabel, loading, error, linkNode }) {
  const [values, setValues] = useState(() =>
    Object.fromEntries(fields.map((f) => [f.name, f.defaultValue ?? '']))
  )
  const [fieldErrors, setFieldErrors] = useState({})
  const [touched, setTouched] = useState({})

  const validate = (name, value) => {
    const field = fields.find((f) => f.name === name)
    return field?.validate ? field.validate(value, values) : null
  }

  const handleChange = (name, value) => {
    const newValues = { ...values, [name]: value }
    setValues(newValues)
    if (touched[name]) {
      const field = fields.find((f) => f.name === name)
      const err = field?.validate ? field.validate(value, newValues) : null
      setFieldErrors((e) => ({ ...e, [name]: err }))
    }
  }

  const handleBlur = (name) => {
    setTouched((t) => ({ ...t, [name]: true }))
    const err = validate(name, values[name])
    setFieldErrors((e) => ({ ...e, [name]: err }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const allErrors = {}
    let hasErrors = false
    fields.forEach((f) => {
      const err = f.validate ? f.validate(values[f.name], values) : null
      if (err) { allErrors[f.name] = err; hasErrors = true }
    })
    setFieldErrors(allErrors)
    setTouched(Object.fromEntries(fields.map((f) => [f.name, true])))
    if (!hasErrors) onSubmit(values)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      {fields.map((field) => {
        const err = fieldErrors[field.name]
        const value = values[field.name]

        if (field.type === 'checkbox') {
          return (
            <div key={field.name}>
              <label className="flex items-start gap-3 cursor-pointer">
                <div className="relative mt-0.5">
                  <input
                    id={`auth-${field.name}`}
                    type="checkbox"
                    checked={!!value}
                    onChange={(e) => handleChange(field.name, e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    onClick={() => handleChange(field.name, !value)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors cursor-pointer ${
                      value ? 'bg-cyan-600 border-cyan-600' : 'bg-gray-700 border-gray-600'
                    }`}
                  >
                    {value && (
                      <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-sm text-gray-300">{field.label}</span>
              </label>
              {err && touched[field.name] && (
                <p className="text-red-400 text-xs mt-1 ml-8">{err}</p>
              )}
            </div>
          )
        }

        return (
          <div key={field.name}>
            <label htmlFor={`auth-${field.name}`} className="block text-sm font-medium text-gray-300 mb-1.5">
              {field.label}
            </label>
            <input
              id={`auth-${field.name}`}
              type={field.type || 'text'}
              value={value}
              placeholder={field.placeholder}
              autoComplete={field.autoComplete}
              onChange={(e) => handleChange(field.name, e.target.value)}
              onBlur={() => handleBlur(field.name)}
              className={`w-full bg-gray-700 border rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none transition-colors text-sm ${
                err && touched[field.name]
                  ? 'border-red-500 focus:border-red-400'
                  : 'border-gray-600 focus:border-cyan-400'
              }`}
            />
            {err && touched[field.name] && (
              <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
                </svg>
                {err}
              </p>
            )}
          </div>
        )
      })}

      <button
        id="auth-submit-btn"
        type="submit"
        disabled={loading}
        className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-semibold rounded-lg px-6 py-3 transition-all duration-200 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Processing...
          </>
        ) : submitLabel}
      </button>

      {linkNode && <div className="text-center text-sm text-gray-400">{linkNode}</div>}
    </form>
  )
}
