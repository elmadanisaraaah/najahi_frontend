const BASE_URL = import.meta.env.VITE_API_URL || ''

const request = async (method, path, body = null) => {
  const token = localStorage.getItem('najahi_token')
  const headers = { 'Content-Type': 'application/json' }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw { status: res.status, ...data }
  }

  return data
}

export const api = {
  get:    (path) => request('GET', path),
  post:   (path, body) => request('POST', path, body),
  put:    (path, body) => request('PUT', path, body),
  delete: (path) => request('DELETE', path),
}

export const auth = {
  login:    (body) => api.post('/api/auth/login', body),
  register: (body) => api.post('/api/auth/register', body),
  me:       ()     => api.get('/api/profile/me'),
}

export default api