import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [showPw, setShowPw] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    // TODO: replace with a real authentication call
    login()
    navigate('/dashboard')
  }

  return (
    <>
      <Navbar />
      <div className="auth-body">
        <div className="auth-bg"></div>
        <div className="auth-overlay"></div>

        <div className="auth-card">
          <img src="/images/kiddocare-logo.png" alt="KiddoCare" className="auth-logo auth-logo--lg" />
          <h2>Welcome back</h2>
          <p className="auth-sub spaced">Sign in to manage your child's health records</p>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email:</label>
              <input type="email" placeholder="juan@gmail.com" required />
            </div>
            <div className="form-group password-wrap">
              <label>Password:</label>
              <input type={showPw ? 'text' : 'password'} placeholder="Enter your password" required />
              <button type="button" className="toggle-pw" onClick={() => setShowPw(!showPw)}>👁</button>
            </div>
            <a href="#" className="forgot-link">Forgot password?</a>
            <button type="submit" className="btn-primary">Login account</button>
          </form>
          <p className="auth-links">Don't have an account? <Link to="/signup">Sign Up</Link></p>
        </div>
      </div>
      <Footer />
    </>
  )
}
