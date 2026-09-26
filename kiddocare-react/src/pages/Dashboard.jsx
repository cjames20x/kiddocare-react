import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Home, User, ClipboardCheck, Baby, ClipboardList, Syringe,
  CreditCard, FileText, ThumbsUp, HelpCircle, Bell, Search, Plus, Users, Calendar, Check,
  X, AlertTriangle, ShieldCheck,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import DashboardSidebar from '../components/DashboardSidebar.jsx'

function calcAge(dob) {
  if (!dob) return '—'
  const birth = new Date(dob)
  const diff = new Date() - birth
  if (diff < 0) return '0 years'
  const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25))
  if (years === 0) {
    const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30.4375))
    return `${months} mo${months === 1 ? '' : 's'}`
  }
  return `${years} yr${years === 1 ? '' : 's'}`
}

// Normalizes casing so older/mismatched records ("checkup") display the same as ("Checkup")
function formatServiceName(service) {
  if (!service) return '—'
  return service.charAt(0).toUpperCase() + service.slice(1).toLowerCase()
}

// Shared child-record popup — used by BOTH the Dashboard tab's quick "View"
// and the Child Information tab's "View", so the two always look identical.
// onRebook is optional: pass it to show a Rebook button alongside Close.
function ChildRecordModal({ child, onClose, onRebook, getChildAppointments }) {
  if (!child) return null
  const childAppointments = getChildAppointments(child.id)

  return (
    <div className="kcmr-overlay" onClick={onClose}>
      <div className="kcmr-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="kcmr-header">
          <button className="kcmr-close" onClick={onClose} aria-label="Close">
            <X size={15} />
          </button>
          <div className="kcmr-avatar">{child.name.charAt(0).toUpperCase()}</div>
          <div>
            <div className="kcmr-name">{child.name}</div>
            <div className="kcmr-sub">
              <span className="kcmr-badge">{child.id}</span>
              <span className="kcmr-badge">{child.gender}</span>
            </div>
          </div>
        </div>

        <div className="kcmr-body">
          {/* Quick stats */}
          <div className="kcmr-stats">
            <div className="kcmr-stat">
              <div className="kcmr-stat-label">Age</div>
              <div className="kcmr-stat-value">{child.age}</div>
            </div>
            <div className="kcmr-stat">
              <div className="kcmr-stat-label">Weight</div>
              <div className="kcmr-stat-value">{child.weight && child.weight !== '—' ? child.weight : '8.6 kg'}</div>
            </div>
            <div className="kcmr-stat">
              <div className="kcmr-stat-label">Height</div>
              <div className="kcmr-stat-value">{child.height && child.height !== '—' ? child.height : '71 cm'}</div>
            </div>
            <div className="kcmr-stat">
              <div className="kcmr-stat-label">Last Visit</div>
              <div className="kcmr-stat-value">{child.lastVisit && child.lastVisit !== '—' ? child.lastVisit : '2026-08-15'}</div>
            </div>
          </div>

          {/* Allergy alert */}
          <div className="kcmr-section">
            <div className="kcmr-section-title">Allergies</div>
            {child.allergies && child.allergies !== 'None known' ? (
              <div className="kcmr-alert warn">
                <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
                <span>Known allergy: {child.allergies}</span>
              </div>
            ) : (
              <div className="kcmr-alert ok">
                <ShieldCheck size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
                <span>No known allergies on file</span>
              </div>
            )}
          </div>

          {/* Guardian */}
          <div className="kcmr-section">
            <div className="kcmr-section-title">Parent / Guardian</div>
            <div className="kcmr-grid2">
              <div className="kcmr-field">
                <div className="kcmr-field-label">Full Name</div>
                <div className="kcmr-field-value">{child.guardian}</div>
              </div>
              <div className="kcmr-field">
                <div className="kcmr-field-label">Contact</div>
                <div className="kcmr-field-value">{child.contact || '—'}</div>
              </div>
            </div>
          </div>

          {/* Vaccination history */}
          <div className="kcmr-section">
            <div className="kcmr-section-title">Vaccination History</div>
            {!child.vaccinations || child.vaccinations.length === 0 ? (
              <p className="kcmr-empty">No vaccinations on record yet.</p>
            ) : (
              <div className="kcmr-list">
                {child.vaccinations.map((v, i) => (
                  <div className="kcmr-list-item" key={i}>
                    <div className="kcmr-list-icon"><Syringe size={15} /></div>
                    <div className="kcmr-list-main">
                      <div className="kcmr-list-title">{v}</div>
                    </div>
                    <span className="kcmr-pill ok">Completed</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Appointment history */}
          <div className="kcmr-section">
            <div className="kcmr-section-title">Appointment History</div>
            {childAppointments.length === 0 ? (
              <p className="kcmr-empty">No visits scheduled yet.</p>
            ) : (
              <div className="kcmr-list">
                {childAppointments.map((a) => {
                  const status = (a.status || 'Confirmed')
                  const pillClass =
                    status.toLowerCase() === 'completed' ? 'ok' :
                    status.toLowerCase() === 'cancelled' ? 'danger' : 'info'
                  return (
                    <div className="kcmr-list-item" key={a.id}>
                      <div className="kcmr-list-icon"><Calendar size={15} /></div>
                      <div className="kcmr-list-main">
                        <div className="kcmr-list-title">{formatServiceName(a.service)}</div>
                        <div className="kcmr-list-sub">{a.date} · {a.time}</div>
                      </div>
                      <span className={`kcmr-pill ${pillClass}`}>{status}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <div className="kcmr-footer">
          {onRebook && (
            <button type="button" className="kcmr-btn-outline" onClick={onRebook}>
              Rebook
            </button>
          )}
          <button type="button" className="kcmr-btn-close" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

const NAV_ITEMS = [
  { icon: Home, label: 'Dashboard' },
  { icon: User, label: 'Child Information' },
  { icon: ClipboardCheck, label: 'Book Appointments' },
  { icon: Baby, label: 'Register Child' },
  { icon: ClipboardList, label: 'Appointments' },
  { icon: Syringe, label: 'Vaccinations' },
  { icon: CreditCard, label: 'Payments' },
  { icon: FileText, label: 'Documents' },
  { icon: ThumbsUp, label: 'Feedback' },
  { icon: HelpCircle, label: 'Help' },
]

// These tabs are full standalone pages of their own, not internal dashboard tabs.
// Clicking them should navigate there instead of switching activeTab.
const ROUTE_TABS = {
  Documents: '/documents',
  Feedback: '/feedback',
  Help: '/help',
  Vaccinations: '/vaccinations',
  Payments: '/payments',
}

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Active navigation tab — honor a tab requested via navigate('/dashboard', { state: { activeTab } })
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'Dashboard')
  const [showConfirm, setShowConfirm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewChild, setViewChild] = useState(null)
  const [legacyViewChild, setLegacyViewChild] = useState(null)

  // Children state (initialized from user and localStorage)
  const [children, setChildren] = useState(() => {
    const saved = localStorage.getItem('kiddocare-children')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        console.error(e)
      }
    }
    if (user?.patientName) {
      return [{
        id: 'KC-001',
        name: user.patientName,
        dob: user.dob || '',
        age: calcAge(user.dob),
        gender: user.gender ? user.gender[0].toUpperCase() + user.gender.slice(1) : '—',
        lastVisit: '2026-08-15',
        guardian: user.guardianName || '—',
        contact: user.contactNumber || '—',
        weight: '8.6 kg',
        height: '71 cm',
        allergies: 'Penicillin',
        vaccinations: ['BCG', 'Hepatitis B', 'Pentavalent (DTP-HepB-Hib)', 'OPV', 'PCV'],
      }]
    }
    return [
      {
        id: 'KC-001',
        name: 'Liam Garcia',
        dob: '2022-04-12',
        age: calcAge('2022-04-12'),
        gender: 'Male',
        lastVisit: '2026-08-10',
        guardian: user?.guardianName || 'Maria Garcia',
        contact: '+63 917 123 4567',
        weight: '13.2 kg',
        height: '88 cm',
        allergies: 'Peanuts',
        vaccinations: ['BCG', 'Hepatitis B', 'DTaP', 'MMR'],
      },
    ]
  })

  // Appointments state
  const [appointments, setAppointments] = useState(() => {
    const saved = localStorage.getItem('kiddocare-appointments')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {}
    }
    return [
      {
        id: 1,
        childId: 'KC-001',
        childName: children[0]?.name || 'Liam Garcia',
        service: 'Checkup',
        date: '2026-10-02',
        time: '09:00 AM - 10:00 AM',
        status: 'Confirmed'
      }
    ]
  })

  // Persist children to localStorage
  useEffect(() => {
    localStorage.setItem('kiddocare-children', JSON.stringify(children))
  }, [children])

  // Persist appointments to localStorage
  useEffect(() => {
    localStorage.setItem('kiddocare-appointments', JSON.stringify(appointments))
  }, [appointments])

  // Form states: Register Child
  const [registerForm, setRegisterForm] = useState({
    name: '',
    dob: '',
    gender: 'Male',
    guardian: user?.guardianName || '',
    contact: user?.contactNumber || '',
    relationship: 'Mother',
  })

  // Form states: Book Appointment
  const [bookForm, setBookForm] = useState({
    childId: children[0]?.id || '',
    service: 'Checkup',
    date: '',
    time: '09:00 AM - 10:00 AM',
    notes: '',
  })

  function confirmLogout() {
    logout()
    navigate('/')
  }

  // Handle Child Registration
  function handleRegisterChild(e) {
    e.preventDefault()
    if (!registerForm.name.trim() || !registerForm.dob) {
      alert('Please fill out all required fields.')
      return
    }

    const nextId = `KC-00${children.length + 1}`
    const newChild = {
      id: nextId,
      name: registerForm.name.trim(),
      dob: registerForm.dob,
      age: calcAge(registerForm.dob),
      gender: registerForm.gender,
      lastVisit: '—',
      guardian: registerForm.guardian || user?.guardianName || '—',
      contact: registerForm.contact || user?.contactNumber || '—',
      weight: '—',
      height: '—',
      allergies: 'None known',
      vaccinations: [],
    }

    setChildren([newChild, ...children])
    setRegisterForm({
      name: '',
      dob: '',
      gender: 'Male',
      guardian: user?.guardianName || '',
      contact: user?.contactNumber || '',
      relationship: 'Mother',
    })
    alert('Child successfully registered!')
    setActiveTab('Child Information')
  }

  // Handle Book Appointment
  function handleBookAppointment(e) {
    e.preventDefault()
    if (!bookForm.childId || !bookForm.date) {
      alert('Please select a child and preferred appointment date.')
      return
    }

    const child = children.find((c) => c.id === bookForm.childId)
    const newAppt = {
      id: Date.now(),
      childId: bookForm.childId,
      childName: child ? child.name : 'Unknown',
      service: bookForm.service,
      date: bookForm.date,
      time: bookForm.time,
      notes: bookForm.notes,
      status: 'Confirmed'
    }

    setAppointments([newAppt, ...appointments])
    alert('Appointment successfully booked!')
    setActiveTab('Appointments')
  }

  // Get this child's appointments, most relevant (soonest upcoming) first
  function getChildAppointments(childId) {
    return appointments
      .filter((a) => a.childId === childId)
      .slice()
      .sort((a, b) => new Date(a.date) - new Date(b.date))
  }

  // Next scheduled visit for a child (soonest appointment today or later, else soonest overall)
  function getNextVisit(childId) {
    const appts = getChildAppointments(childId)
    if (appts.length === 0) return '—'
    const today = new Date().setHours(0, 0, 0, 0)
    const upcoming = appts.find((a) => new Date(a.date).setHours(0, 0, 0, 0) >= today)
    const next = upcoming || appts[appts.length - 1]
    return next.date
  }

  // Filter children by search query
  const filteredChildren = children.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.guardian.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="dash-layout">
      <style>{`
        .kcmr-overlay { position: fixed; inset: 0; background: rgba(15,23,42,.55); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
        .kcmr-modal { width: 100%; max-width: 560px; max-height: 88vh; background: #fff; border-radius: 18px; overflow: hidden; box-shadow: 0 24px 60px rgba(15,23,42,.35); display: flex; flex-direction: column; animation: kcmrPop .18s ease-out; }
        @keyframes kcmrPop { from { transform: scale(.96); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .kcmr-header { position: relative; background: var(--blue, #1c5d99); padding: 24px 28px 20px; display: flex; align-items: center; gap: 14px; color: #fff; }
        .kcmr-close { position: absolute; top: 14px; right: 14px; width: 28px; height: 28px; border-radius: 50%; background: rgba(255,255,255,.18); border: none; color: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; }
        .kcmr-close:hover { background: rgba(255,255,255,.3); }
        .kcmr-avatar { width: 54px; height: 54px; border-radius: 50%; flex-shrink: 0; background: rgba(255,255,255,.2); border: 2px solid rgba(255,255,255,.45); display: flex; align-items: center; justify-content: center; font-size: 21px; font-weight: 700; }
        .kcmr-name { font-size: 18px; font-weight: 700; }
        .kcmr-sub { display: flex; gap: 6px; margin-top: 5px; flex-wrap: wrap; }
        .kcmr-badge { font-size: 10.5px; font-weight: 700; letter-spacing: .3px; background: rgba(255,255,255,.2); padding: 3px 9px; border-radius: 20px; }
        .kcmr-body { padding: 20px 26px 6px; overflow-y: auto; }
        .kcmr-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 18px; }
        .kcmr-stat { background: #f1f5f9; border-radius: 10px; padding: 10px 6px; text-align: center; }
        .kcmr-stat-label { font-size: 9.5px; font-weight: 700; letter-spacing: .4px; color: #64748b; text-transform: uppercase; }
        .kcmr-stat-value { font-size: 13.5px; font-weight: 700; color: #0f172a; margin-top: 3px; }
        .kcmr-section { margin-bottom: 18px; }
        .kcmr-section-title { font-size: 11.5px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; color: var(--blue, #1c5d99); margin-bottom: 9px; }
        .kcmr-alert { display: flex; align-items: flex-start; gap: 9px; border-radius: 10px; padding: 11px 13px; font-size: 13px; font-weight: 600; }
        .kcmr-alert.warn { background: #fef3c7; color: #92400e; }
        .kcmr-alert.ok { background: #dcfce7; color: #15803d; }
        .kcmr-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .kcmr-field { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 9px 12px; }
        .kcmr-field-label { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: .3px; }
        .kcmr-field-value { font-size: 13px; font-weight: 600; color: #1e293b; margin-top: 2px; }
        .kcmr-list { display: flex; flex-direction: column; gap: 8px; }
        .kcmr-list-item { display: flex; align-items: center; gap: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 9px 12px; }
        .kcmr-list-icon { width: 30px; height: 30px; border-radius: 8px; background: #e0f2fe; color: #0369a1; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .kcmr-list-main { flex: 1; min-width: 0; }
        .kcmr-list-title { font-size: 13px; font-weight: 700; color: #1e293b; }
        .kcmr-list-sub { font-size: 11px; color: #64748b; margin-top: 1px; }
        .kcmr-empty { font-size: 12.5px; color: #94a3b8; font-style: italic; padding: 4px 2px 2px; }
        .kcmr-pill { font-size: 10.5px; font-weight: 700; padding: 3px 9px; border-radius: 20px; white-space: nowrap; flex-shrink: 0; }
        .kcmr-pill.ok { background: #dcfce7; color: #15803d; }
        .kcmr-pill.info { background: #dbeafe; color: #1d4ed8; }
        .kcmr-pill.warn { background: #fef3c7; color: #92400e; }
        .kcmr-pill.danger { background: #fee2e2; color: #b91c1c; }
        .kcmr-footer { padding: 14px 26px 22px; display: flex; gap: 10px; }
        .kcmr-btn-close { flex: 1; padding: 11px; border-radius: 10px; border: none; background: var(--blue, #1c5d99); color: #fff; font-weight: 700; font-size: 14px; cursor: pointer; }
        .kcmr-btn-close:hover { filter: brightness(0.92); }
        .kcmr-btn-outline { flex: 1; padding: 11px; border-radius: 10px; border: 1.5px solid var(--blue, #1c5d99); background: #fff; color: var(--blue, #1c5d99); font-weight: 700; font-size: 14px; cursor: pointer; }
        .kcmr-btn-outline:hover { background: #eff6ff; }
        @media (max-width: 480px) { .kcmr-stats { grid-template-columns: repeat(2, 1fr); } .kcmr-grid2 { grid-template-columns: 1fr; } }
      `}</style>

      {/* SIDEBAR */}
      <aside className="dash-sidebar">
        <div className="dash-logo" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('Dashboard')}>
          <img src="/images/kiddocare-logo.png" alt="KiddoCare" />
        </div>
        <nav className="dash-nav">
          {NAV_ITEMS.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className={`dash-nav-item${activeTab === label ? ' active' : ''}`}
              onClick={() => {
                if (ROUTE_TABS[label]) {
                  navigate(ROUTE_TABS[label])
                } else {
                  setActiveTab(label)
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

      {/* MAIN CONTENT AREA */}
      <main className="dash-main">
        {/* Topbar */}
        <div className="dash-topbar">
          <h1 className="dash-title">{activeTab.toUpperCase()}</h1>
          <div className="dash-bell">
            <Bell size={20} />
            <span className="dash-bell-dot"></span>
          </div>
        </div>

        {/* Quick Stat Cards (Hidden on Book Appointments) */}
        {activeTab !== 'Book Appointments' && (
          <div className="dash-cards">
            <div
              className="dash-card"
              style={{ cursor: 'pointer' }}
              onClick={() => setActiveTab('Child Information')}
            >
              <div>
                <div className="num">{children.length}</div>
                <div>Children</div>
              </div>
              <User size={44} className="dash-card-icon" />
            </div>

            <div
              className="dash-card"
              style={{ cursor: 'pointer' }}
              onClick={() => setActiveTab('Appointments')}
            >
              <div>
                <div className="num">{appointments.length}</div>
                <div>Upcoming Appointment{appointments.length === 1 ? '' : 's'}</div>
              </div>
              <Calendar size={44} className="dash-card-icon" />
            </div>

            <div
              className="dash-card"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate('/payments')}
            >
              <div>
                <div className="num">2</div>
                <div>Pending Payments</div>
              </div>
              <CreditCard size={44} className="dash-card-icon" />
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB: DASHBOARD (unchanged — original Rebook + View) */}
        {/* ========================================================= */}
        {activeTab === 'Dashboard' && (
          <div className="dash-panel">
            <h3>
              <Users size={20} /> Children
            </h3>

            <div className="dash-search">
              <div className="dash-search-input">
                <input
                  placeholder="Search Patients by name, ID, guardian..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search size={18} />
              </div>
              <button
                className="dash-add-btn dash-add-btn--blue"
                onClick={() => setActiveTab('Register Child')}
              >
                <Plus size={16} /> Add New
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>PatientId</th>
                    <th>Name</th>
                    <th>Age</th>
                    <th>Gender</th>
                    <th>Next Visit</th>
                    <th>Parent/Guardian</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredChildren.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', color: '#999', padding: '28px' }}>
                        No children registered yet.
                      </td>
                    </tr>
                  ) : (
                    filteredChildren.map((c) => (
                      <tr key={c.id}>
                        <td><strong>{c.id}</strong></td>
                        <td style={{ fontWeight: 600, color: 'var(--blue)' }}>{c.name}</td>
                        <td>{c.age}</td>
                        <td>{c.gender}</td>
                        <td>{getNextVisit(c.id)}</td>
                        <td>{c.guardian}</td>
                        <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                          <button
                            className="dash-action-btn btn-action-book"
                            onClick={() => {
                              setBookForm((prev) => ({ ...prev, childId: c.id }))
                              setActiveTab('Book Appointments')
                            }}
                          >
                            Rebook
                          </button>
                          <button
                            className="dash-action-btn btn-action-view"
                            onClick={() => setLegacyViewChild(c)}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB: CHILD INFORMATION (medical record View modal) */}
        {/* ========================================================= */}
        {activeTab === 'Child Information' && (
          <div className="dash-panel">
            <h3>
              <Users size={20} /> Child Records
            </h3>

            <div className="dash-search">
              <div className="dash-search-input">
                <input
                  placeholder="Search Patients by name, ID, guardian..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search size={18} />
              </div>
              <button
                className="dash-add-btn dash-add-btn--blue"
                onClick={() => setActiveTab('Register Child')}
              >
                <Plus size={16} /> Add New
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>PatientId</th>
                    <th>Name</th>
                    <th>Age</th>
                    <th>Gender</th>
                    <th>Next Visit</th>
                    <th>Parent/Guardian</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredChildren.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', color: '#999', padding: '28px' }}>
                        No children registered yet.
                      </td>
                    </tr>
                  ) : (
                    filteredChildren.map((c) => (
                      <tr key={c.id}>
                        <td><strong>{c.id}</strong></td>
                        <td style={{ fontWeight: 600, color: 'var(--blue)' }}>{c.name}</td>
                        <td>{c.age}</td>
                        <td>{c.gender}</td>
                        <td>{getNextVisit(c.id)}</td>
                        <td>{c.guardian}</td>
                        <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                          <button
                            className="dash-action-btn btn-action-view"
                            style={{
                              background: 'var(--blue)',
                              borderColor: 'var(--blue)',
                              color: '#fff',
                            }}
                            onClick={() => setViewChild(c)}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB: REGISTER CHILD */}
        {/* ========================================================= */}
        {activeTab === 'Register Child' && (
          <div className="dash-panel" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h3>
              <Baby size={22} /> Register Child
            </h3>

            <form className="appointment-form" onSubmit={handleRegisterChild} style={{ padding: '16px 0' }}>
              <div className="form-row">
                <div className="form-group">
                  <label>
                    Patient's Full Name: <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Liam Garcia"
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>
                    Date of Birth: <span className="required">*</span>
                  </label>
                  <input
                    type="date"
                    value={registerForm.dob}
                    onChange={(e) => setRegisterForm({ ...registerForm, dob: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Gender: <span className="required">*</span></label>
                  <select
                    value={registerForm.gender}
                    onChange={(e) => setRegisterForm({ ...registerForm, gender: e.target.value })}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>
                    Parent/Guardian Name: <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Maria Garcia"
                    value={registerForm.guardian}
                    onChange={(e) => setRegisterForm({ ...registerForm, guardian: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Guardian Contact Number:</label>
                  <input
                    type="tel"
                    placeholder="e.g. 09171234567"
                    value={registerForm.contact}
                    onChange={(e) => setRegisterForm({ ...registerForm, contact: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Relationship to Patient:</label>
                  <input
                    type="text"
                    placeholder="e.g. Mother, Father"
                    value={registerForm.relationship}
                    onChange={(e) => setRegisterForm({ ...registerForm, relationship: e.target.value })}
                  />
                </div>
              </div>

              <button type="submit" className="btn-book" style={{ marginTop: '12px' }}>
                Register Child
              </button>
            </form>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB: BOOK APPOINTMENTS */}
        {/* ========================================================= */}
        {activeTab === 'Book Appointments' && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 'calc(100vh - 220px)',
            padding: '20px 0'
          }}>
            <div className="appointment-card" style={{ width: '100%', maxWidth: '920px' }}>
              <div className="appointment-info">
                <span className="appointment-eyebrow">Pediatric care, on your schedule</span>
                <h2>Book an appointment</h2>
                <p>Tell us what your child needs and we'll match you with the right visit — usually confirmed the same day.</p>
                <ul className="appointment-perks">
                  <li><Check size={18} /> Open slots within this week</li>
                  <li><Check size={18} /> Licensed pediatricians only</li>
                  <li><Check size={18} /> Records saved to your account</li>
                </ul>
              </div>

              <div className="appointment-main">
              <form className="appointment-form" onSubmit={handleBookAppointment}>
                <div className="form-group">
                  <label>
                    Select Child / Patient: <span className="required">*</span>
                  </label>
                  <select
                    value={bookForm.childId}
                    onChange={(e) => setBookForm({ ...bookForm, childId: e.target.value })}
                    required
                  >
                    <option value="" disabled>-- Select a registered child --</option>
                    {children.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.id})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>
                      Service: <span className="required">*</span>
                    </label>
                    <select
                      value={bookForm.service}
                      onChange={(e) => setBookForm({ ...bookForm, service: e.target.value })}
                    >
                      <option value="Checkup">General Pediatric Checkup</option>
                      <option value="Vaccination">Vaccination / Immunization</option>
                      <option value="Growth Assessment">Growth Assessment</option>
                      <option value="Consultation">Urgent Consultation</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>
                      Preferred Date: <span className="required">*</span>
                    </label>
                    <input
                      type="date"
                      value={bookForm.date}
                      onChange={(e) => setBookForm({ ...bookForm, date: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Time Slot:</label>
                    <select
                      value={bookForm.time}
                      onChange={(e) => setBookForm({ ...bookForm, time: e.target.value })}
                    >
                      <option value="09:00 AM - 10:00 AM">09:00 AM - 10:00 AM</option>
                      <option value="10:30 AM - 11:30 AM">10:30 AM - 11:30 AM</option>
                      <option value="01:00 PM - 02:00 PM">01:00 PM - 02:00 PM</option>
                      <option value="03:00 PM - 04:00 PM">03:00 PM - 04:00 PM</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Guardian / Contact:</label>
                    <input
                      type="text"
                      value={user?.guardianName || 'Parent / Guardian'}
                      readOnly
                      disabled
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Notes / Symptoms (Optional):</label>
                  <input
                    type="text"
                    placeholder="Enter any symptoms or questions for the doctor..."
                    value={bookForm.notes}
                    onChange={(e) => setBookForm({ ...bookForm, notes: e.target.value })}
                  />
                </div>

                <button type="submit" className="btn-book">Confirm Appointment</button>
              </form>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB: APPOINTMENTS LIST */}
        {/* ========================================================= */}
        {activeTab === 'Appointments' && (
          <div className="dash-panel">
            <h3><ClipboardList size={20} /> Scheduled Appointments</h3>
            <div style={{ overflowX: 'auto' }}>
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Patient Name</th>
                    <th>Service</th>
                    <th>Date</th>
                    <th>Time Slot</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', color: '#999', padding: '24px' }}>
                        No appointments booked yet.
                      </td>
                    </tr>
                  ) : (
                    appointments.map((a) => (
                      <tr key={a.id}>
                        <td><strong>{a.childName}</strong></td>
                        <td>{formatServiceName(a.service)}</td>
                        <td>{a.date}</td>
                        <td>{a.time}</td>
                        <td>
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: '12px',
                            background: '#e0f2fe',
                            color: '#0369a1',
                            fontWeight: 700,
                            fontSize: '12px'
                          }}>
                            {a.status || 'Confirmed'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button
                className="dash-add-btn"
                style={{ display: 'inline-flex' }}
                onClick={() => setActiveTab('Book Appointments')}
              >
                + Book Another Appointment
              </button>
            </div>
          </div>
        )}

        {/* Placeholder for tabs with no dedicated page yet (Vaccinations, Payments).
            Documents/Feedback/Help now navigate to their own routes above, so they never reach here. */}
        {!['Dashboard', 'Child Information', 'Register Child', 'Book Appointments', 'Appointments'].includes(activeTab) && (
          <div className="dash-panel" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <h3 style={{ justifyContent: 'center', borderBottom: 'none' }}>{activeTab}</h3>
            <p style={{ color: 'var(--slate-63)', marginTop: '8px' }}>
              This section is currently under development and will be available soon.
            </p>
          </div>
        )}
      </main>

      {/* CONFIRM LOGOUT MODAL */}
      {showConfirm && (
        <div className="confirm-overlay" onClick={() => setShowConfirm(false)}>
          <div className="confirm-box" onClick={(e) => e.stopPropagation()}>
            <p>Are you sure you want to log out?</p>
            <div className="confirm-actions">
              <button
                type="button"
                style={{ background: '#e2e8f0', color: 'var(--slate-63)' }}
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                style={{ background: 'var(--rose)', color: 'var(--white)' }}
                onClick={confirmLogout}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DASHBOARD TAB — quick view popup (same design as Child Information's) */}
      {legacyViewChild && (
        <ChildRecordModal
          child={legacyViewChild}
          onClose={() => setLegacyViewChild(null)}
          onRebook={() => {
            setBookForm((prev) => ({ ...prev, childId: legacyViewChild.id }))
            setActiveTab('Book Appointments')
            setLegacyViewChild(null)
          }}
          getChildAppointments={getChildAppointments}
        />
      )}

      {/* CHILD INFORMATION TAB — detailed record popup */}
      {viewChild && (
        <ChildRecordModal
          child={viewChild}
          onClose={() => setViewChild(null)}
          getChildAppointments={getChildAppointments}
        />
      )}
    </div>
  )
}