/**
 * Validate full name: 2–100 characters, letters/spaces/hyphens only.
 */
export function validateFullName(name) {
  if (!name || name.trim().length < 2) return 'Name must be at least 2 characters.'
  if (name.trim().length > 100) return 'Name must be at most 100 characters.'
  if (!/^[a-zA-Z\s'-]+$/.test(name.trim())) return 'Name may only contain letters, spaces, hyphens, and apostrophes.'
  return null
}

/**
 * Validate email using RFC 5322 simplified regex.
 */
export function validateEmail(email) {
  if (!email) return 'Email is required.'
  const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/
  if (!re.test(email)) return 'Enter a valid email address.'
  return null
}

/**
 * Validate password: min 8 chars, 1 uppercase, 1 digit.
 */
export function validatePassword(password) {
  if (!password || password.length < 8) return 'Password must be at least 8 characters.'
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter.'
  if (!/[0-9]/.test(password)) return 'Password must contain at least one digit.'
  return null
}

/**
 * Validate password confirmation matches.
 */
export function validatePasswordConfirm(password, confirm) {
  if (!confirm) return 'Please confirm your password.'
  if (password !== confirm) return 'Passwords do not match.'
  return null
}

/**
 * Validate blur strength: odd number between 3–101.
 */
export function validateBlurStrength(v) {
  const n = Number(v)
  if (!Number.isInteger(n) || n < 3 || n > 101) return 'Blur strength must be between 3 and 101.'
  if (n % 2 === 0) return 'Blur strength must be an odd number.'
  return null
}

/**
 * Validate confidence threshold: between 0.10 and 0.90.
 */
export function validateConfThreshold(v) {
  const n = Number(v)
  if (isNaN(n) || n < 0.1 || n > 0.9) return 'Confidence threshold must be between 0.10 and 0.90.'
  return null
}
