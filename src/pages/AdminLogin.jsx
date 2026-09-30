import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function AdminLogin() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [showPw, setShowPw] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (email === 'kiddocareadmin@gmail.com') {
      login()
      navigate('/admin-dashboard')
    } else {
      setError('Invalid admin credentials')
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
          <h2>Admin Login</h2>
          <p className="auth-sub spaced">Sign in to access the administrator dashboard</p>
          {error && <p style={{ color: 'red', textAlign: 'center', marginBottom: '1rem' }}>{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email:</label>
              <input 
                type="email" 
                placeholder="admin@gmail.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
            <div className="form-group password-wrap">
              <label>Password:</label>
              <input 
                type={showPw ? 'text' : 'password'} 
                placeholder="Enter your password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
              <button type="button" className="toggle-pw" onClick={() => setShowPw(!showPw)}>👁</button>
            </div>
            <a href="#" className="forgot-link">Forgot password?</a>
            <button type="submit" className="btn-primary">Login to Admin</button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  )
}
