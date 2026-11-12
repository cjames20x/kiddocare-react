import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function Login() {
  const { login, completeMfaLogin, logout } = useAuth()
  const navigate = useNavigate()
  const STAFF_ROLES = ['admin', 'clinic_manager', 'doctor', 'staff']

  function enforceGuardianRole(role) {
    if (role && STAFF_ROLES.includes(role)) {
      logout()
      setError('Admin and staff credentials cannot be used to sign in as a user. Please use the Admin Login.')
      return false
    }
    return true
  }
  const [showPw, setShowPw] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Set once the backend says this account needs a second factor.
  const [mfaPendingToken, setMfaPendingToken] = useState(null)
  const [mfaCode, setMfaCode] = useState('')
  const [emailHint, setEmailHint] = useState('')
  const [devCode, setDevCode] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const result = await login(email, password)
      if (result.role && STAFF_ROLES.includes(result.role)) {
        logout()
        setError('Admin and staff credentials cannot be used to sign in as a user. Please use the Admin Login.')
        return
      }
      if (result.mfaRequired) {
        setMfaPendingToken(result.mfaPendingToken)
      } else {
        if (!enforceGuardianRole(result.user?.role)) return
        navigate('/dashboard')
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.')
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
      if (!enforceGuardianRole(user?.role)) return
      navigate('/dashboard')
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
              <h2>Welcome back</h2>
              <p className="auth-sub spaced">Sign in to manage your child's health records</p>
              {error && <p className="auth-error">{error}</p>}
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Email:</label>
                  <input
                    type="email" placeholder="juan@gmail.com" required
                    value={email} onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="form-group password-wrap">
                  <label>Password:</label>
                  <div className="pw-input-wrap">
                    <input
                      type={showPw ? 'text' : 'password'} placeholder="Enter your password" required
                      value={password} onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="toggle-pw"
                      onClick={() => setShowPw(!showPw)}
                      aria-label={showPw ? 'Hide password' : 'Show password'}
                    >
                      {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <a href="#" className="forgot-link">Forgot password?</a>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Signing in…' : 'Login account'}
                </button>
              </form>
              <p className="auth-links">Don't have an account? <Link to="/signup">Sign Up</Link></p>
              <p className="auth-links" style={{marginTop: '0.5rem', fontSize: '0.85rem'}}><Link to="/admin">Admin Login</Link></p>
            </>
          ) : (
            <>
              <h2>Two-step verification</h2>
              <p className="auth-sub spaced">Enter the 6-digit verification code sent to <strong>{emailHint || 'your email'}</strong></p>
              {devCode && (
                <div style={{
                  background: '#ecfdf5',
                  border: '1.5px solid #a7f3d0',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  marginBottom: '16px',
                  fontSize: '13px',
                  color: '#065f46',
                  textAlign: 'center'
                }}>
                  <div style={{ fontWeight: 600 }}>Your MFA Code:</div>
                  <div style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '4px', margin: '4px 0', color: '#047857' }}>
                    {devCode}
                  </div>
                  <div style={{ fontSize: '11px', color: '#059669' }}>
                    (Code auto-filled. Click &quot;Verify &amp; log in&quot; below)
                  </div>
                </div>
              )}
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
