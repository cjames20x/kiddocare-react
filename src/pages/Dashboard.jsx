import { Bell, Search, Plus, Users, Calendar, User, CreditCard } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import DashboardSidebar from '../components/DashboardSidebar.jsx'

function calcAge(dob) {
  if (!dob) return '—'
  const birth = new Date(dob)
  const years = Math.floor((new Date() - birth) / (1000 * 60 * 60 * 24 * 365.25))
  return `${years} year${years === 1 ? '' : 's'}`
}

export default function Dashboard() {
  const { user } = useAuth()

  const children = user?.patientName
    ? [{
        id: 'KC-001',
        name: user.patientName,
        age: calcAge(user.dob),
        gender: user.gender ? user.gender[0].toUpperCase() + user.gender.slice(1) : '—',
        lastVisit: '—',
        guardian: user.guardianName || '—',
      }]
    : []

  return (
    <div className="dash-layout">
      <DashboardSidebar active="Dashboard" />

      <main className="dash-main">
        <div className="dash-topbar">
          <h1 className="dash-title">DASHBOARD</h1>
          <div className="dash-bell">
            <Bell size={20} />
            <span className="dash-bell-dot"></span>
          </div>
        </div>

        <div className="dash-cards">
          <div className="dash-card">
            <div>
              <div className="num">{children.length}</div>
              <div>Children</div>
            </div>
            <User size={44} className="dash-card-icon" />
          </div>
          <div className="dash-card">
            <div>
              <div className="num">1</div>
              <div>Upcoming Appointment</div>
            </div>
            <Calendar size={44} className="dash-card-icon" />
          </div>
          <div className="dash-card">
            <div>
              <div className="num">2</div>
              <div>Pending Payments</div>
            </div>
            <CreditCard size={44} className="dash-card-icon" />
          </div>
        </div>

        <div className="dash-panel">
          <h3><Users size={20} /> Children</h3>
          <div className="dash-search">
            <div className="dash-search-input">
              <input placeholder="Search Patients" />
              <Search size={18} />
            </div>
            <button className="dash-add-btn"><Plus size={16} /> Add New</button>
          </div>
          <table className="dash-table">
            <thead>
              <tr><th>PatientId</th><th>Name</th><th>Age</th><th>Gender</th><th>Last Visit</th><th>Parent/Guardian</th></tr>
            </thead>
            <tbody>
              {children.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: '#999' }}>No children registered yet.</td></tr>
              ) : (
                children.map((c) => (
                  <tr key={c.id}>
                    <td>{c.id}</td><td>{c.name}</td><td>{c.age}</td>
                    <td>{c.gender}</td><td>{c.lastVisit}</td><td>{c.guardian}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
