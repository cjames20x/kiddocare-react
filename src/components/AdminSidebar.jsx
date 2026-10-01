import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Home, User, Baby, Clipboard, List, FileBarChart, CreditCard, Pill, FilePieChart
} from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

const NAV_ITEMS = [
  { icon: Home, label: 'Dashboard', path: '/admin-dashboard' },
  { icon: User, label: 'User Management', path: '/admin-dashboard' },
  { icon: Baby, label: 'Patient Management', path: '/admin-dashboard' },
  { icon: Clipboard, label: 'Medical Records', path: '/admin-dashboard' },
  { icon: List, label: 'Appointments', path: '/admin-dashboard' },
  { icon: FileBarChart, label: 'Vaccinations', path: '/admin-dashboard' },
  { icon: CreditCard, label: 'Payments', path: '/admin-dashboard' },
  { icon: Pill, label: 'Prescriptions', path: '/admin-dashboard' },
  { icon: FilePieChart, label: 'Reports', path: '/admin-dashboard' },
]

export default function AdminSidebar({ active }) {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [showConfirm, setShowConfirm] = useState(false)

  function confirmLogout() {
    logout()
    navigate('/')
  }

  return (
    <>
      <aside className="dash-sidebar">
        <div className="dash-logo">
          <img src="/images/kiddocare-logo.png" alt="KiddoCare" />
        </div>
        <nav className="dash-nav">
          {NAV_ITEMS.map(({ icon: Icon, label, path }) => (
            <div
              key={label}
              className={`dash-nav-item${label === active ? ' active' : ''}`}
              style={label === active ? { color: '#fff' } : {}}
              onClick={() => {
                navigate(path, { state: { activeTab: label } })
              }}
            >
              <Icon size={20} style={label === active ? { color: '#fff' } : {}} />
              <span>{label}</span>
            </div>
          ))}
        </nav>
        
        <div className="dash-logout-wrap" style={{ marginTop: 'auto' }}>
          <button className="dash-logout-btn" onClick={() => setShowConfirm(true)}>Logout</button>
        </div>
      </aside>

      {showConfirm && (
        <div className="confirm-overlay" onClick={() => setShowConfirm(false)}>
          <div className="confirm-box" onClick={(e) => e.stopPropagation()}>
            <p>Are you sure you want to log out?</p>
            <div className="confirm-actions">
              <button className="btn-secondary" onClick={() => setShowConfirm(false)}>Cancel</button>
              <button className="btn-primary" onClick={confirmLogout}>Yes</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
