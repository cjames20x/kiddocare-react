import React, { useState } from 'react';

// Demo initial child records
const INITIAL_CHILDREN = [
  { id: 'CH001', name: 'Liam Garcia', dob: '2021-04-12', gender: 'Male', guardian: 'Maria Garcia', phone: '+1 234 567 890' },
  { id: 'CH002', name: 'Sophia Smith', dob: '2022-08-20', gender: 'Female', guardian: 'John Smith', phone: '+1 234 888 123' },
  { id: 'CH003', name: 'Noah Davis', dob: '2020-11-05', gender: 'Male', guardian: 'Emma Davis', phone: '+1 234 321 456' },
];

export default function UserDashboard() {
  // Navigation tabs: 'info' | 'register' | 'book'
  const [activeTab, setActiveTab] = useState('info');

  // State management
  const [children, setChildren] = useState(INITIAL_CHILDREN);
  const [appointments, setAppointments] = useState([
    { id: 1, childName: 'Liam Garcia', service: 'Vaccination', date: '2026-10-05', time: '10:00 AM' }
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [childToDelete, setChildToDelete] = useState(null);

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
      phone: registerForm.phone
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

  // Handle Child Deletion
  const confirmDelete = () => {
    if (childToDelete) {
      setChildren(children.filter((c) => c.id !== childToDelete.id));
      setChildToDelete(null);
    }
  };

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
                        <td style={{ textAlign: 'center', whiteWrap: 'nowrap' }}>
                          <button
                            onClick={() => {
                              setBookForm({ ...bookForm, childId: c.id });
                              setActiveTab('book');
                            }}
                            style={{
                              background: 'transparent',
                              border: '1px solid var(--blue)',
                              color: 'var(--blue)',
                              padding: '5px 10px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              marginRight: '8px',
                              fontWeight: 600
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
                              padding: '5px 10px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontWeight: 600
                            }}
                          >
                            Delete
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

      {/* CONFIRMATION MODAL (DELETE ACTION) */}
      {childToDelete && (
        <div className="confirm-overlay" onClick={() => setChildToDelete(null)}>
          <div className="confirm-box" onClick={(e) => e.stopPropagation()}>
            <p>
              Are you sure you want to remove <strong>{childToDelete.name}</strong> from your records?
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
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}