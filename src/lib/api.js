// Central place that knows how to talk to the KiddoCare backend.
// Every other file calls these functions instead of using fetch() directly.

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`

  let res
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch (err) {
    // Network failure — almost always means the backend isn't running,
    // or VITE_API_BASE_URL is pointed at the wrong place.
    throw new ApiError(
      `Could not reach the server at ${API_BASE}. Is the backend running? (npm run dev in kiddocare-backend)`,
      0
    )
  }

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new ApiError(data.message || `Request failed (${res.status})`, res.status)
  }

  return data
}

// ---- Auth ----
export const registerAccount = (payload) => request('/api/auth/register', { method: 'POST', body: payload })

export const loginAccount = (username, password) =>
  request('/api/auth/login', { method: 'POST', body: { username, password } })

export const verifyMfaLogin = (mfa_pending_token, code) =>
  request('/api/auth/mfa/verify-login', { method: 'POST', body: { mfa_pending_token, code } })

export const fetchMe = (token) => request('/api/auth/me', { token })

export const logoutAccount = (refresh_token) =>
  request('/api/auth/logout', { method: 'POST', body: { refresh_token } })

// ---- Patients ----
export const registerPatient = (payload, token) =>
  request('/api/patients', { method: 'POST', body: payload, token })

export const listMyPatients = (token, search) =>
  request(`/api/patients${search ? `?search=${encodeURIComponent(search)}` : ''}`, { token })

export const getPatient = (id, token) => request(`/api/patients/${id}`, { token })

export const updatePatient = (id, payload, token) =>
  request(`/api/patients/${id}`, { method: 'PUT', body: payload, token })

// ---- Feedback ----
// GET  /api/feedback  -> { feedback: [...] } newest first
// POST /api/feedback  -> { message, feedback }  body: rating (1-5), topic, message, is_anonymous, display_name
export const listFeedback = (token) => request('/api/feedback', { token })

export const submitFeedback = (payload, token) =>
  request('/api/feedback', { method: 'POST', body: payload, token })

// ---- Doctors ----
export const listDoctors = (token) => request('/api/doctors', { token })

// ---- Appointments ----
export const checkAvailability = (doctorId, date, token) =>
  request(`/api/appointments/availability?doctor_id=${encodeURIComponent(doctorId)}&date=${encodeURIComponent(date)}`, { token })

export const listAppointments = (token, filters = {}) => {
  const params = new URLSearchParams()
  if (filters.doctor_id) params.set('doctor_id', filters.doctor_id)
  if (filters.patient_id) params.set('patient_id', filters.patient_id)
  if (filters.status && filters.status !== 'All') params.set('status', filters.status)
  if (filters.date) params.set('date', filters.date)
  if (filters.start_date) params.set('start_date', filters.start_date)
  if (filters.end_date) params.set('end_date', filters.end_date)
  const qs = params.toString()
  return request(`/api/appointments${qs ? `?${qs}` : ''}`, { token })
}

export const getAppointment = (id, token) =>
  request(`/api/appointments/${id}`, { token })

export const createAppointment = (payload, token) =>
  request('/api/appointments', { method: 'POST', body: payload, token })

export const updateAppointmentStatus = (id, status, token) =>
  request(`/api/appointments/${id}/status`, { method: 'PATCH', body: { status }, token })

export const rescheduleAppointment = (id, payload, token) =>
  request(`/api/appointments/${id}`, { method: 'PATCH', body: payload, token })

export { ApiError, API_BASE }
