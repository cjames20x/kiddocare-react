import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Home, User, ClipboardCheck, Baby, ClipboardList, Syringe,
  CreditCard, FileText, ThumbsUp, HelpCircle, Bell, Search, Plus, Users, Calendar, Check,
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

  // Active navigation tab
  const [activeTab, setActiveTab] = useState('Dashboard')
  const [showConfirm, setShowConfirm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [childToDelete, setChildToDelete] = useState(null)

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
        lastVisit: '—',
        guardian: user.guardianName || '—',
        contact: user.contactNumber || '—',
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
    service: 'checkup',
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

  // Handle Child Deletion
  function handleDeleteChild() {
    if (childToDelete) {
      setChildren(children.filter((c) => c.id !== childToDelete.id))
      setChildToDelete(null)
    }
  }

  // Filter children by search query
  const filteredChildren = children.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.guardian.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="dash-layout">
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
        {/* TAB: DASHBOARD & TAB: CHILD INFORMATION */}
        {/* ========================================================= */}
        {(activeTab === 'Dashboard' || activeTab === 'Child Information') && (
          <div className="dash-panel">
            <h3>
              <Users size={20} /> {activeTab === 'Child Information' ? 'Child Records' : 'Children'}
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
                className="dash-add-btn"
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
                    <th>Last Visit</th>
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
                        <td>{c.lastVisit}</td>
                        <td>{c.guardian}</td>
                        <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                          <button
                            onClick={() => {
                              setBookForm((prev) => ({ ...prev, childId: c.id }))
                              setActiveTab('Book Appointments')
                            }}
                            style={{
                              background: 'transparent',
                              border: '1px solid var(--blue)',
                              color: 'var(--blue)',
                              padding: '5px 12px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              marginRight: '8px',
                              fontWeight: 700,
                              fontSize: '12px'
                            }}
                          >
                            Book
                          </button>
                          <button
                            onClick={() => setChildToDelete(c)}
                            style={{
                              background: 'transparent',
                              border: '1px solid var(--rose)',
                              color: 'var(--rose)',
                              padding: '5px 12px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontWeight: 700,
                              fontSize: '12px'
                            }}
                          >
                            Delete
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
                        <td>{a.service}</td>
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

      {/* CONFIRM DELETE MODAL */}
      {childToDelete && (
        <div className="confirm-overlay" onClick={() => setChildToDelete(null)}>
          <div className="confirm-box" onClick={(e) => e.stopPropagation()}>
            <p>
              Are you sure you want to remove <strong>{childToDelete.name}</strong> ({childToDelete.id}) from records?
            </p>
            <div className="confirm-actions">
              <button
                type="button"
                style={{ background: '#e2e8f0', color: 'var(--slate-63)' }}
                onClick={() => setChildToDelete(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                style={{ background: 'var(--rose)', color: 'var(--white)' }}
                onClick={handleDeleteChild}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}