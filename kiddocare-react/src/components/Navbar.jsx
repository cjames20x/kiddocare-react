import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Navbar() {
  const { isLoggedIn, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <header className="navbar">
      <div className="logo">
        <img src="/images/kiddocare-logo.png" alt="KiddoCare" className="logo-img" />
      </div>
      <nav className="nav-links">
        <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
          HOME
        </NavLink>
        <NavLink to="/services" className={({ isActive }) => (isActive ? 'active' : '')}>
          SERVICES
        </NavLink>
        <Link to="/#about">ABOUT</Link>
      </nav>
      <div className="nav-actions">
        {isLoggedIn ? (
          <>
            <Link to="/dashboard" className="btn-outline">My Account</Link>
            <button type="button" className="btn-solid" onClick={handleLogout}>Log Out</button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn-outline">Sign In</Link>
            <Link to="/signup" className="btn-solid">Sign Up</Link>
          </>
        )}
      </div>
    </header>
  )
}
