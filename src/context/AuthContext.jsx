import { createContext, useContext, useEffect, useState } from 'react'
import { registerAccount, loginAccount, verifyMfaLogin, fetchMe, logoutAccount, ApiError } from '../lib/api.js'

const AuthContext = createContext(null)

// Shapes the real backend profile into the fields the existing pages
// (Dashboard.jsx especially) already expect from `user`, so none of that
// UI code had to change. Patient-specific fields (patientName, dob,
// gender) aren't in the real `users` table yet — those still come from
// whatever was entered at signup, stored alongside in localStorage by
// Signup.jsx, until the patients module is connected to this frontend too.
function shapeProfile(backendUser, signupExtras) {
  if (!backendUser) return null
  return {
    id: backendUser.user_id,
    email: backendUser.email,
    username: backendUser.username,
    role: backendUser.role,
    guardianName: backendUser.full_name,
    contactNumber: backendUser.contact_number,
    mfaEnabled: backendUser.mfa_enabled,
    ...signupExtras,
  }
}

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('kiddocare-access-token'))
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('kiddocare-refresh-token'))
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true) // true while we check an existing session on first load

  // On first load, if a token was saved from a previous visit, confirm it's
  // still valid by asking the backend who it belongs to (a real DB read,
  // not just trusting what's in localStorage).
  useEffect(() => {
    let cancelled = false
    async function rehydrate() {
      if (!accessToken) {
        setLoading(false)
        return
      }
      try {
        const profile = await fetchMe(accessToken)
        const extras = JSON.parse(localStorage.getItem('kiddocare-signup-extras') || 'null')
        if (!cancelled) setUser(shapeProfile(profile, extras))
      } catch (err) {
        // Token expired/invalid — clear it so the app treats this as logged out.
        if (!cancelled) clearSession()
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    rehydrate()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function storeSession({ access_token, refresh_token, user: backendUser }, signupExtras) {
    localStorage.setItem('kiddocare-access-token', access_token)
    localStorage.setItem('kiddocare-refresh-token', refresh_token)
    setAccessToken(access_token)
    setRefreshToken(refresh_token)
    setUser(shapeProfile(backendUser, signupExtras))
  }

  function clearSession() {
    localStorage.removeItem('kiddocare-access-token')
    localStorage.removeItem('kiddocare-refresh-token')
    setAccessToken(null)
    setRefreshToken(null)
    setUser(null)
  }

  // Returns { mfaRequired: true, mfaPendingToken } if the account has MFA
  // turned on, or throws an ApiError with a human-readable .message on bad
  // credentials / network failure. Callers (Login.jsx, AdminLogin.jsx)
  // handle both cases.
  async function login(username, password) {
    const result = await loginAccount(username, password)
    if (result.mfa_required) {
      return { mfaRequired: true, mfaPendingToken: result.mfa_pending_token }
    }
    storeSession(result)
    return { mfaRequired: false, user: result.user }
  }

  async function completeMfaLogin(mfaPendingToken, code) {
    const result = await verifyMfaLogin(mfaPendingToken, code)
    storeSession(result)
    return result.user
  }

  // Creates the account, then logs in immediately so the caller lands
  // straight in the dashboard. `signupExtras` (patientName/dob/gender/etc.)
  // isn't sent to the backend — the real users table doesn't have columns
  // for it yet — but it's kept in localStorage so the rest of the UI
  // (which already expected those fields on `user`) keeps working.
  async function register(payload, signupExtras) {
    await registerAccount(payload)
    if (signupExtras) localStorage.setItem('kiddocare-signup-extras', JSON.stringify(signupExtras))
    const result = await loginAccount(payload.username, payload.password)
    if (result.mfa_required) {
      return { mfaRequired: true, mfaPendingToken: result.mfa_pending_token }
    }
    storeSession(result, signupExtras)
    return { mfaRequired: false, user: result.user, accessToken: result.access_token }
  }

  function logout() {
    // Best-effort: revoke the session server-side, but don't make the UI
    // wait on it — the user should feel logged out instantly.
    if (refreshToken) logoutAccount(refreshToken).catch(() => {})
    localStorage.removeItem('kiddocare-signup-extras')
    clearSession()
  }

  const isLoggedIn = Boolean(user)

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, user, loading, accessToken, login, completeMfaLogin, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

export { ApiError }
