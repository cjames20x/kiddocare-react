import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Home, User, ClipboardCheck, Baby, ClipboardList, Syringe,
  CreditCard, FileText, ThumbsUp, HelpCircle,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

const NAV_ITEMS = [
  { icon: Home, label: 'Dashboard', path: '/dashboard' },
  { icon: User, label: 'Child Information', path: '/dashboard' },
  { icon: ClipboardCheck, label: 'Book Appointments', path: '/dashboard' },
  { icon: Baby, label: 'Register Child', path: '/dashboard' },
  { icon: ClipboardList, label: 'Appointments', path: '/dashboard' },
  { icon: Syringe, label: 'Vaccinations', path: '/vaccinations' },
  { icon: CreditCard, label: 'Payments', path: '/payments' },
  { icon: FileText, label: 'Documents', path: '/documents' },
  { icon: ThumbsUp, label: 'Feedback', path: '/feedback' },
  { icon: HelpCircle, label: 'Help', path: '/help' },
]

// These labels are internal tabs inside Dashboard.jsx, not their own routes.
// Navigate to /dashboard and tell it which tab to open.
const DASHBOARD_TABS = ['Dashboard', 'Child Information', 'Book Appointments', 'Register Child', 'Appointments']

export default function DashboardSidebar({ active }) {
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
              onClick={() => {
                if (DASHBOARD_TABS.includes(label)) {
                  navigate(path, { state: { activeTab: label } })
                } else {
                  navigate(path)
                }
              }}
            >
              <Icon size={20} />
              <span>{label}</span>
            </div>
          ))}
        </nav>
        <div className="dash-logout-wrap">
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