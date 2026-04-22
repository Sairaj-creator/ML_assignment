const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

async function request(method, path, body, token) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || `HTTP ${res.status}`)
  }
  return res.json()
}

const post = (path, body, token) => request('POST', path, body, token)

export const predict = ({ image_b64, blur_strength, confidence_threshold, model_variant, return_blurred }, token) =>
  post('/api/predict', { image_b64, blur_strength, confidence_threshold, model_variant, return_blurred }, token)
