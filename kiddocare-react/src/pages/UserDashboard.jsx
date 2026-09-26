import React, { useState } from 'react';
import { X, AlertTriangle, ShieldCheck, Syringe, Calendar } from 'lucide-react';

// Computes a human-readable age ("2 yrs" / "10 mos") from a date of birth
function calcAge(dob) {
  if (!dob) return '—';
  const birth = new Date(dob);
  const diff = new Date() - birth;
  if (diff < 0) return '0 mos';
  const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  if (years === 0) {
    const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30.4375));
    return `${months} mo${months === 1 ? '' : 's'}`;
  }
  return `${years} yr${years === 1 ? '' : 's'}`;
}

// Normalizes casing so older/mismatched records ("checkup") display the same as ("Checkup")
function formatServiceName(service) {
  if (!service) return '—';
  return service.charAt(0).toUpperCase() + service.slice(1).toLowerCase();
}

// Demo initial child records
const INITIAL_CHILDREN = [
  {
    id: 'CH001', name: 'Liam Garcia', dob: '2021-04-12', gender: 'Male',
    guardian: 'Maria Garcia', phone: '+1 234 567 890',
    weight: '13.2 kg', height: '88 cm', allergies: 'Peanuts', lastVisit: '2026-08-10',
    vaccinations: ['BCG', 'Hepatitis B', 'DTaP', 'MMR'],
  },
  {
    id: 'CH002', name: 'Sophia Smith', dob: '2022-08-20', gender: 'Female',
    guardian: 'John Smith', phone: '+1 234 888 123',
    weight: '11.5 kg', height: '82 cm', allergies: 'None known', lastVisit: '2026-07-22',
    vaccinations: ['BCG', 'Hepatitis B'],
  },
  {
    id: 'CH003', name: 'Noah Davis', dob: '2020-11-05', gender: 'Male',
    guardian: 'Emma Davis', phone: '+1 234 321 456',
    weight: '15.8 kg', height: '95 cm', allergies: 'None known', lastVisit: '2026-06-30',
    vaccinations: ['BCG', 'Hepatitis B', 'DTaP', 'MMR', 'Varicella'],
  },
];

export default function UserDashboard() {
  // Navigation tabs: 'info' | 'register' | 'book'
  const [activeTab, setActiveTab] = useState('info');

  // State management
  const [children, setChildren] = useState(INITIAL_CHILDREN);
  const [appointments, setAppointments] = useState([
    { id: 1, childId: 'CH001', childName: 'Liam Garcia', service: 'Vaccination', date: '2026-10-05', time: '10:00 AM' }
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewChild, setViewChild] = useState(null);

  // Form states: Register Child
  const [registerForm, setRegisterForm] = useState({
    name: '',
    dob: '',
    gender: 'Male',
    guardian: '',
    phone: '',
    allergies: ''
  });

  // Form states: Book Appointment
  const [bookForm, setBookForm] = useState({
    childId: '',
    service: 'General Checkup',
    date: '',
    timeSlot: '09:00 AM',
    notes: ''
  });

  // Search filter
  const filteredChildren = children.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.guardian.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle Child Registration
  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!registerForm.name || !registerForm.dob || !registerForm.guardian) {
      alert('Please fill out all required fields.');
      return;
    }

    const newChild = {
      id: `CH00${children.length + 1}`,
      name: registerForm.name,
      dob: registerForm.dob,
      gender: registerForm.gender,
      guardian: registerForm.guardian,
      phone: registerForm.phone,
      weight: '—',
      height: '—',
      allergies: registerForm.allergies || 'None known',
      lastVisit: '—',
      vaccinations: [],
    };

    setChildren([newChild, ...children]);
    setRegisterForm({ name: '', dob: '', gender: 'Male', guardian: '', phone: '', allergies: '' });
    alert('Child successfully registered!');
    setActiveTab('info');
  };

  // Handle Booking Appointment
  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (!bookForm.childId || !bookForm.date) {
      alert('Please select a child and preferred appointment date.');
      return;
    }

    const selectedChild = children.find((c) => c.id === bookForm.childId);
    const newAppointment = {
      id: Date.now(),
      childId: bookForm.childId,
      childName: selectedChild ? selectedChild.name : 'Unknown',
      service: bookForm.service,
      date: bookForm.date,
      time: bookForm.timeSlot
    };

    setAppointments([newAppointment, ...appointments]);
    setBookForm({ childId: '', service: 'General Checkup', date: '', timeSlot: '09:00 AM', notes: '' });
    alert('Appointment successfully booked!');
    setActiveTab('info');
  };

  // Get this child's appointments, soonest first — used in the medical record View modal
  const getChildAppointments = (childId) =>
    appointments
      .filter((a) => a.childId === childId)
      .slice()
      .sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="dash-layout">
      {/* SIDEBAR */}
      <aside className="dash-sidebar">
        <div className="dash-logo">
          {/* Replace with your logo image path */}
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--pink)', letterSpacing: '1px' }}>
            KIDCARE
          </div>
        </div>

        <nav className="dash-nav">
          <div
            className={`dash-nav-item ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span>Child Information</span>
          </div>

          <div
            className={`dash-nav-item ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => setActiveTab('register')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
            <span>Register Child</span>
          </div>

          <div
            className={`dash-nav-item ${activeTab === 'book' ? 'active' : ''}`}
            onClick={() => setActiveTab('book')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>Book Appointments</span>
          </div>
        </nav>

        <div className="dash-logout-wrap">
          <button className="dash-logout-btn" onClick={() => alert('Logged out')}>
            Log Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="dash-main">
        {/* Topbar */}
        <header className="dash-topbar">
          <h1 className="dash-title">
            {activeTab === 'info' && 'Child Information'}
            {activeTab === 'register' && 'Register Child'}
            {activeTab === 'book' && 'Book Appointments'}
          </h1>
          <div className="dash-bell" title="Notifications">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span className="dash-bell-dot"></span>
          </div>
        </header>

        {/* Quick Stats Overview */}
        <section className="dash-cards">
          <div className="dash-card">
            <div>
              <div className="num">{children.length}</div>
              <div>Registered Children</div>
            </div>
            <div className="dash-card-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
            </div>
          </div>

          <div className="dash-card">
            <div>
              <div className="num">{appointments.length}</div>
              <div>Upcoming Appointments</div>
            </div>
            <div className="dash-card-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
              </svg>
            </div>
          </div>

          <div className="dash-card">
            <div>
              <div className="num">Active</div>
              <div>Account Status</div>
            </div>
            <div className="dash-card-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* TAB 1: CHILD INFORMATION */}
        {/* ========================================================= */}
        {activeTab === 'info' && (
          <div className="dash-panel">
            <h3>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
              Child Records
            </h3>

            {/* Search and Action Bar */}
            <div className="dash-search">
              <div className="dash-search-input">
                <input
                  type="text"
                  placeholder="Search by name, ID, or guardian..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              <button className="dash-add-btn" onClick={() => setActiveTab('register')}>
                + Register New Child
              </button>
            </div>

            {/* Records Table */}
            <div style={{ overflowX: 'auto' }}>
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Child ID</th>
                    <th>Full Name</th>
                    <th>Date of Birth</th>
                    <th>Gender</th>
                    <th>Guardian</th>
                    <th>Contact</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredChildren.length > 0 ? (
                    filteredChildren.map((c) => (
                      <tr key={c.id}>
                        <td><strong>{c.id}</strong></td>
                        <td>{c.name}</td>
                        <td>{c.dob}</td>
                        <td>{c.gender}</td>
                        <td>{c.guardian}</td>
                        <td>{c.phone}</td>
                        <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                          <button
                            onClick={() => setViewChild(c)}
                            style={{
                              background: 'var(--blue)',
                              border: '1px solid var(--blue)',
                              color: '#fff',
                              padding: '5px 10px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontWeight: 600
                            }}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '24px' }}>
                        No child records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: REGISTER CHILD */}
        {/* ========================================================= */}
        {activeTab === 'register' && (
          <div className="dash-panel" style={{ maxWidth: '780px', margin: '0 auto' }}>
            <h3>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="20" y1="8" x2="20" y2="14" />
                <line x1="23" y1="11" x2="17" y2="11" />
              </svg>
              Child Registration Form
            </h3>

            <form className="dash-appointment-form" onSubmit={handleRegisterSubmit} style={{ padding: '20px 0' }}>
              <div className="dash-form-row">
                <div className="dash-form-group">
                  <label>
                    Child's Full Name <span className="dash-required">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Liam Garcia"
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="dash-form-group">
                  <label>
                    Date of Birth <span className="dash-required">*</span>
                  </label>
                  <input
                    type="date"
                    value={registerForm.dob}
                    onChange={(e) => setRegisterForm({ ...registerForm, dob: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="dash-form-row">
                <div className="dash-form-group">
                  <label>Gender</label>
                  <select
                    value={registerForm.gender}
                    onChange={(e) => setRegisterForm({ ...registerForm, gender: e.target.value })}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="dash-form-group">
                  <label>
                    Parent/Guardian Full Name <span className="dash-required">*</span>
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

              <div className="dash-form-row">
                <div className="dash-form-group">
                  <label>Guardian Contact Phone</label>
                  <input
                    type="tel"
                    placeholder="+1 234 567 8900"
                    value={registerForm.phone}
                    onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                  />
                </div>
                <div className="dash-form-group">
                  <label>Known Allergies / Medical Notes</label>
                  <input
                    type="text"
                    placeholder="e.g. Peanuts, Penicillin (Optional)"
                    value={registerForm.allergies}
                    onChange={(e) => setRegisterForm({ ...registerForm, allergies: e.target.value })}
                  />
                </div>
              </div>

              <button type="submit" className="dash-btn-book">
                Save & Register Child
              </button>
            </form>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: BOOK APPOINTMENTS */}
        {/* ========================================================= */}
        {activeTab === 'book' && (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div className="dash-appointment-card" style={{ width: '100%', maxWidth: '920px' }}>
              <div className="dash-appointment-info">
                <span className="dash-appointment-eyebrow">Pediatric care, on your schedule</span>
                <h2>Book an appointment</h2>
                <p>Tell us what your child needs and we'll match you with the right visit — usually confirmed the same day.</p>
                <ul className="dash-appointment-perks">
                  <li>
                    <svg width="18" height="18" viewBox="0 0 20 20"><path d="M4 10.5l4 4 8-9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    Open slots within this week
                  </li>
                  <li>
                    <svg width="18" height="18" viewBox="0 0 20 20"><path d="M4 10.5l4 4 8-9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    Licensed pediatricians only
                  </li>
                  <li>
                    <svg width="18" height="18" viewBox="0 0 20 20"><path d="M4 10.5l4 4 8-9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    Records saved to your account
                  </li>
                </ul>
              </div>

              <div className="dash-appointment-main">
              <form className="dash-appointment-form" onSubmit={handleBookingSubmit}>
                <div className="dash-form-group">
                  <label>
                    Select Child <span className="dash-required">*</span>
                  </label>
                  <select
                    value={bookForm.childId}
                    onChange={(e) => setBookForm({ ...bookForm, childId: e.target.value })}
                    required
                  >
                    <option value="">-- Choose registered child --</option>
                    {children.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.id})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="dash-form-row">
                  <div className="dash-form-group">
                    <label>
                      Service Required <span className="dash-required">*</span>
                    </label>
                    <select
                      value={bookForm.service}
                      onChange={(e) => setBookForm({ ...bookForm, service: e.target.value })}
                    >
                      <option value="General Pediatric Checkup">General Pediatric Checkup</option>
                      <option value="Vaccination">Vaccination / Immunization</option>
                      <option value="Growth & Nutrition">Growth & Nutrition Assessment</option>
                      <option value="Dental Checkup">Dental Checkup</option>
                      <option value="Urgent Consultation">Urgent Consultation</option>
                    </select>
                  </div>

                  <div className="dash-form-group">
                    <label>
                      Preferred Date <span className="dash-required">*</span>
                    </label>
                    <input
                      type="date"
                      value={bookForm.date}
                      onChange={(e) => setBookForm({ ...bookForm, date: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="dash-form-row">
                  <div className="dash-form-group">
                    <label>Time Slot</label>
                    <select
                      value={bookForm.timeSlot}
                      onChange={(e) => setBookForm({ ...bookForm, timeSlot: e.target.value })}
                    >
                      <option value="09:00 AM">09:00 AM - 10:00 AM</option>
                      <option value="10:30 AM">10:30 AM - 11:30 AM</option>
                      <option value="01:00 PM">01:00 PM - 02:00 PM</option>
                      <option value="03:00 PM">03:00 PM - 04:00 PM</option>
                    </select>
                  </div>
                  <div className="dash-form-group">
                    <label>Additional Notes</label>
                    <input
                      type="text"
                      placeholder="Symptoms or questions (Optional)"
                      value={bookForm.notes}
                      onChange={(e) => setBookForm({ ...bookForm, notes: e.target.value })}
                    />
                  </div>
                </div>

                <button type="submit" className="dash-btn-book">
                  Confirm Appointment
                </button>
              </form>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* VIEW CHILD MEDICAL RECORD MODAL */}
      {viewChild && (
        <div className="kcmr-overlay" onClick={() => setViewChild(null)}>
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
            .kcmr-footer { padding: 14px 26px 22px; }
            .kcmr-btn-close { width: 100%; padding: 11px; border-radius: 10px; border: none; background: var(--blue, #1c5d99); color: #fff; font-weight: 700; font-size: 14px; cursor: pointer; }
            .kcmr-btn-close:hover { filter: brightness(0.92); }
            @media (max-width: 480px) { .kcmr-stats { grid-template-columns: repeat(2, 1fr); } .kcmr-grid2 { grid-template-columns: 1fr; } }
          `}</style>

          <div className="kcmr-modal" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="kcmr-header">
              <button className="kcmr-close" onClick={() => setViewChild(null)} aria-label="Close">
                <X size={15} />
              </button>
              <div className="kcmr-avatar">{viewChild.name.charAt(0).toUpperCase()}</div>
              <div>
                <div className="kcmr-name">{viewChild.name}</div>
                <div className="kcmr-sub">
                  <span className="kcmr-badge">{viewChild.id}</span>
                  <span className="kcmr-badge">{viewChild.gender}</span>
                </div>
              </div>
            </div>

            <div className="kcmr-body">
              {/* Quick stats */}
              <div className="kcmr-stats">
                <div className="kcmr-stat">
                  <div className="kcmr-stat-label">Age</div>
                  <div className="kcmr-stat-value">{calcAge(viewChild.dob)}</div>
                </div>
                <div className="kcmr-stat">
                  <div className="kcmr-stat-label">Weight</div>
                  <div className="kcmr-stat-value">{viewChild.weight || '—'}</div>
                </div>
                <div className="kcmr-stat">
                  <div className="kcmr-stat-label">Height</div>
                  <div className="kcmr-stat-value">{viewChild.height || '—'}</div>
                </div>
                <div className="kcmr-stat">
                  <div className="kcmr-stat-label">Last Visit</div>
                  <div className="kcmr-stat-value">{viewChild.lastVisit || '—'}</div>
                </div>
              </div>

              {/* Allergy alert */}
              <div className="kcmr-section">
                <div className="kcmr-section-title">Allergies</div>
                {viewChild.allergies && viewChild.allergies !== 'None known' ? (
                  <div className="kcmr-alert warn">
                    <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
                    <span>Known allergy: {viewChild.allergies}</span>
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
                    <div className="kcmr-field-value">{viewChild.guardian}</div>
                  </div>
                  <div className="kcmr-field">
                    <div className="kcmr-field-label">Contact</div>
                    <div className="kcmr-field-value">{viewChild.phone || '—'}</div>
                  </div>
                </div>
              </div>

              {/* Vaccination history */}
              <div className="kcmr-section">
                <div className="kcmr-section-title">Vaccination History</div>
                {!viewChild.vaccinations || viewChild.vaccinations.length === 0 ? (
                  <p className="kcmr-empty">No vaccinations on record yet.</p>
                ) : (
                  <div className="kcmr-list">
                    {viewChild.vaccinations.map((v, i) => (
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
                {getChildAppointments(viewChild.id).length === 0 ? (
                  <p className="kcmr-empty">No visits scheduled yet.</p>
                ) : (
                  <div className="kcmr-list">
                    {getChildAppointments(viewChild.id).map((a) => (
                      <div className="kcmr-list-item" key={a.id}>
                        <div className="kcmr-list-icon"><Calendar size={15} /></div>
                        <div className="kcmr-list-main">
                          <div className="kcmr-list-title">{formatServiceName(a.service)}</div>
                          <div className="kcmr-list-sub">{a.date} · {a.time}</div>
                        </div>
                        <span className="kcmr-pill info">Confirmed</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="kcmr-footer">
              <button type="button" className="kcmr-btn-close" onClick={() => setViewChild(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}