import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { useAuth } from '../context/AuthContext.jsx'

const STAFF_ROLES = ['admin', 'clinic_manager', 'doctor', 'staff']

export default function AdminLogin() {
  const { login, completeMfaLogin, logout } = useAuth()
  const navigate = useNavigate()
  const [showPw, setShowPw] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [mfaPendingToken, setMfaPendingToken] = useState(null)
  const [mfaCode, setMfaCode] = useState('')
  const [emailHint, setEmailHint] = useState('')

  function enforceStaffRole(user) {
    if (!STAFF_ROLES.includes(user.role)) {
      logout()
      setError('This portal is for clinic staff accounts, not guardian accounts.')
      return false
    }
    return true
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const result = await login(email, password)
      if (result.mfaRequired) {
        setMfaPendingToken(result.mfaPendingToken)
      } else if (enforceStaffRole(result.user)) {
        navigate('/admin-dashboard')
      }
    } catch (err) {
      setError(err.message || 'Invalid admin credentials')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleMfaSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const user = await completeMfaLogin(mfaPendingToken, mfaCode)
      if (enforceStaffRole(user)) navigate('/admin-dashboard')
    } catch (err) {
      setError(err.message || 'Invalid code. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Navbar />
      <div className="auth-body">
        <div className="auth-bg"></div>
        <div className="auth-overlay"></div>

        <div className="auth-card">
          <img src="/images/kiddocare-logo.png" alt="KiddoCare" className="auth-logo auth-logo--lg" />

          {!mfaPendingToken ? (
            <>
              <h2>Admin Login</h2>
              <p className="auth-sub spaced">Sign in to access the administrator dashboard</p>
              {error && <p className="auth-error">{error}</p>}
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Email:</label>
                  <input
                    type="email" placeholder="admin@gmail.com" required
                    value={email} onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="form-group password-wrap">
                  <label>Password:</label>
                  <input
                    type={showPw ? 'text' : 'password'} placeholder="Enter your password" required
                    value={password} onChange={(e) => setPassword(e.target.value)}
                  />
                  <button type="button" className="toggle-pw" onClick={() => setShowPw(!showPw)}>👁</button>
                </div>
                <a href="#" className="forgot-link">Forgot password?</a>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Signing in…' : 'Login to Admin'}
                </button>
              </form>
            </>
          ) : (
            <>
              <h2>Two-step verification</h2>
              <p className="auth-sub spaced">Enter the 6-digit verification code sent to {emailHint || 'your administrator email'}</p>
              {error && <p className="auth-error">{error}</p>}
              <form onSubmit={handleMfaSubmit}>
                <div className="form-group">
                  <label>Authentication code:</label>
                  <input
                    type="text" inputMode="numeric" placeholder="123456" required
                    value={mfaCode} onChange={(e) => setMfaCode(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Verifying…' : 'Verify & log in'}
                </button>
                <button type="button" className="btn-secondary" onClick={() => { setMfaPendingToken(null); setError('') }}>
                  ← Back
                </button>
              </form>
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}
