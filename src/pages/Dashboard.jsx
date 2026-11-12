import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Baby, ClipboardList, Syringe,
  Bell, Search, Plus, Users, Calendar, Check,
  X, AlertTriangle, ShieldCheck,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import DashboardSidebar from '../components/DashboardSidebar.jsx'
import {
  listMyPatients,
  registerPatient,
  updatePatient,
  listAppointments,
  createAppointment,
  listDoctors,
  checkAvailability,
  setupMfa,
  confirmMfa,
  disableMfa,
} from '../lib/api.js'

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

// Today as YYYY-MM-DD in the user's LOCAL timezone (toISOString would use UTC and can be off by a day)
function todayLocal() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

// A <select> always returns the id as text. Patient ids from the database are numbers.
function sameId(a, b) {
  return a != null && b != null && String(a) === String(b)
}

// Fallback only. New weight/height values are stored in medical_records.
// Older readings that were saved in this browser still show until re-saved.
const CHILD_METRICS_KEY = 'kiddocare-child-metrics'

function readChildMetrics() {
  try {
    return JSON.parse(localStorage.getItem(CHILD_METRICS_KEY) || '{}')
  } catch {
    return {}
  }
}

function metricNumber(value) {
  const text = String(value ?? '').trim()
  if (!text || text === '—') return ''
  const match = text.match(/[\d.]+/)
  if (!match) return ''
  const num = Number(match[0])
  return Number.isFinite(num) && num >= 0 ? String(num) : ''
}

function saveChildMetrics(id, weight, height) {
  const all = readChildMetrics()
  all[String(id)] = { weight: metricNumber(weight), height: metricNumber(height) }
  localStorage.setItem(CHILD_METRICS_KEY, JSON.stringify(all))
}

function formatKg(value) {
  return value ? `${value} kg` : '—'
}

function formatCm(value) {
  return value ? `${value} cm` : '—'
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
              <div className="kcmr-stat-value">{child.weight || '—'}</div>
            </div>
            <div className="kcmr-stat">
              <div className="kcmr-stat-label">Height</div>
              <div className="kcmr-stat-value">{child.height || '—'}</div>
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

// Lightweight demographic-edit modal — PUT /api/patients/:id via onSave.
function EditChildModal({ child, onClose, onSave }) {
  const [form, setForm] = useState(() => ({
    name: child.name,
    dob: child.dob,
    gender: child.gender === '—' ? 'Male' : child.gender,
    address: child.address || '',
    weight: metricNumber(child.weight),
    height: metricNumber(child.height),
  }))
  const [saving, setSaving] = useState(false)

  if (!child) return null

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    await onSave(form)
    setSaving(false)
  }

  return (
    <div className="kcmr-overlay" onClick={onClose}>
      <div className="kcmr-modal" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
        <div className="kcmr-header">
          <button className="kcmr-close" onClick={onClose} aria-label="Close">
            <X size={15} />
          </button>
          <div className="kcmr-avatar">{form.name.charAt(0).toUpperCase()}</div>
          <div>
            <div className="kcmr-name">Edit Demographics</div>
            <div className="kcmr-sub"><span className="kcmr-badge">{child.id}</span></div>
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="kcmr-body">
            <div className="form-group" style={{ marginBottom: 12 }}>
              <label>Full Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group" style={{ marginBottom: 12 }}>
              <label>Date of Birth</label>
              <input type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} required />
            </div>
            <div className="form-group" style={{ marginBottom: 12 }}>
              <label>Gender</label>
              <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 12 }}>
              <label>Address</label>
              <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Optional" />
            </div>
            <div className="form-group" style={{ marginBottom: 12 }}>
              <label>Weight (kg)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                placeholder="e.g. 12.4"
                value={form.weight}
                onChange={(e) => setForm({ ...form, weight: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Height (cm)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                placeholder="e.g. 86"
                value={form.height}
                onChange={(e) => setForm({ ...form, height: e.target.value })}
              />
            </div>
          </div>
          <div className="kcmr-footer">
            <button type="button" className="kcmr-btn-outline" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="submit" className="kcmr-btn-close" disabled={saving}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user, accessToken } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Active navigation tab — honor a tab requested via navigate('/dashboard', { state: { activeTab } })
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'Dashboard')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewChild, setViewChild] = useState(null)
  const [legacyViewChild, setLegacyViewChild] = useState(null)
  const [editChild, setEditChild] = useState(null)

  // Children state — now sourced from the real /api/patients endpoint
  // (previously this was seeded from localStorage/mock data).
  const [children, setChildren] = useState([])
  const [patientsLoading, setPatientsLoading] = useState(true)
  const [patientsError, setPatientsError] = useState('')
  const [registerError, setRegisterError] = useState('')
  const [registerSubmitting, setRegisterSubmitting] = useState(false)

  // Converts a backend patient row into the shape the existing UI expects.
  // Weight and height come from the latest medical_records row.
  // Allergies and vaccinations still aren't connected.
  function toChildShape(p) {
    const metrics = readChildMetrics()[String(p.id)] || {}
    return {
      id: p.id,
      name: p.patient_name,
      dob: p.date_of_birth,
      age: calcAge(p.date_of_birth),
      gender: p.gender ? p.gender[0].toUpperCase() + p.gender.slice(1) : '—',
      lastVisit: '—',
      guardian: user?.guardianName || '—',
      contact: user?.contactNumber || '—',
      address: p.address || '',
      weight: formatKg(p.weight != null ? p.weight : metrics.weight),
      height: formatCm(p.height != null ? p.height : metrics.height),
      allergies: 'None known',
      vaccinations: [],
    }
  }

  async function loadPatients() {
    if (!accessToken) return
    setPatientsLoading(true)
    setPatientsError('')
    try {
      const patients = await listMyPatients(accessToken)
      setChildren(patients.map(toChildShape))
    } catch (err) {
      setPatientsError(err.message || 'Could not load patients.')
    } finally {
      setPatientsLoading(false)
    }
  }

  useEffect(() => {
    loadPatients()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken])

  // Appointments state connected LIVE to Supabase backend
  const [appointments, setAppointments] = useState([])
  const [appointmentsLoading, setAppointmentsLoading] = useState(false)
  const [doctors, setDoctors] = useState([])
  const [bookedSlots, setBookedSlots] = useState([])
  const [checkingSlots, setCheckingSlots] = useState(false)

  // MFA Management Modal state
  const [showMfaModal, setShowMfaModal] = useState(false)
  const [mfaData, setMfaData] = useState(null)
  const [mfaCodeInput, setMfaCodeInput] = useState('')
  const [mfaPasswordInput, setMfaPasswordInput] = useState('')
  const [mfaStatusMsg, setMfaStatusMsg] = useState('')
  const [mfaErrorMsg, setMfaErrorMsg] = useState('')
  const [userMfaEnabled, setUserMfaEnabled] = useState(Boolean(user?.mfaEnabled))

  useEffect(() => {
    setUserMfaEnabled(Boolean(user?.mfaEnabled))
  }, [user])

  // Load appointments live from backend
  async function loadAppointments() {
    if (!accessToken) return
    setAppointmentsLoading(true)
    try {
      const data = await listAppointments(accessToken)
      if (Array.isArray(data)) {
        setAppointments(
          data.map((a) => ({
            id: a.id,
            childId: a.patient_id,
            childName: a.patient_name || 'Child',
            doctorId: a.doctor_id,
            doctorName: a.doctor_name || 'Assigned Doctor',
            service: a.reason_for_visit || 'General Pediatric Checkup',
            date: a.appointment_date,
            time: a.appointment_time ? a.appointment_time.slice(0, 5) : '09:00',
            status: a.status || 'Pending',
          }))
        )
      }
    } catch (err) {
      console.warn('Could not load appointments:', err)
    } finally {
      setAppointmentsLoading(false)
    }
  }

  // Load doctors list
  async function loadDoctorsList() {
    if (!accessToken) return
    try {
      const docs = await listDoctors(accessToken)
      if (Array.isArray(docs)) setDoctors(docs)
    } catch (err) {
      console.warn('Could not load doctors:', err)
    }
  }

  useEffect(() => {
    loadAppointments()
    loadDoctorsList()
    // Poll every 5s for real-time live synchronization between admin and user portals
    const interval = setInterval(() => {
      loadAppointments()
      loadPatients()
    }, 5000)
    return () => clearInterval(interval)
  }, [accessToken])

  // The shared sidebar switches tabs by navigating to /dashboard with state,
  // so keep activeTab in sync whenever that navigation happens.
  useEffect(() => {
    if (location.state?.activeTab) setActiveTab(location.state.activeTab)
  }, [location.key])

  // Form states: Register Child
  const [registerForm, setRegisterForm] = useState({
    name: '',
    dob: '',
    gender: 'Male',
    guardian: user?.guardianName || '',
    contact: user?.contactNumber || '',
    relationship: 'Mother',
    address: '',
    weight: '',
    height: '',
  })

  // Form states: Book Appointment
  const [bookForm, setBookForm] = useState({
    childId: '',
    doctorId: '',
    service: 'General Pediatric Checkup',
    date: '',
    time: '09:00',
    notes: '',
  })
  const [bookSubmitting, setBookSubmitting] = useState(false)

  // Auto-select first child and first doctor when available
  useEffect(() => {
    if (!bookForm.childId && children.length > 0) {
      setBookForm((prev) => ({ ...prev, childId: children[0].id }))
    }
  }, [children])

  useEffect(() => {
    if (!bookForm.doctorId && doctors.length > 0) {
      setBookForm((prev) => ({ ...prev, doctorId: doctors[0].id }))
    }
  }, [doctors])

  // Check slot availability when doctor & date change
  useEffect(() => {
    if (!bookForm.doctorId || !bookForm.date || !accessToken) {
      setBookedSlots([])
      return
    }
    let active = true
    async function checkSlots() {
      setCheckingSlots(true)
      try {
        const res = await checkAvailability(bookForm.doctorId, bookForm.date, accessToken)
        if (active) {
          const booked = (res?.booked_times || []).map((t) => String(t).slice(0, 5))
          setBookedSlots(booked)
          if (booked.includes(bookForm.time)) {
            // Find first unbooked slot
            const allSlots = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00']
            const free = allSlots.find((s) => !booked.includes(s))
            if (free) setBookForm((prev) => ({ ...prev, time: free }))
          }
        }
      } catch (err) {
        if (active) setBookedSlots([])
      } finally {
        if (active) setCheckingSlots(false)
      }
    }
    checkSlots()
    return () => {
      active = false
    }
  }, [bookForm.doctorId, bookForm.date, accessToken])

  // Handle Child Registration
  async function handleRegisterChild(e) {
    e.preventDefault()
    setRegisterError('')
    if (!registerForm.name.trim() || !registerForm.dob) {
      setRegisterError('Please fill out all required fields.')
      return
    }

    if (registerForm.weight === '' || registerForm.height === '' || Number(registerForm.weight) < 0 || Number(registerForm.height) < 0) {
      setRegisterError('Enter this child’s own weight (kg) and height (cm).')
      return
    }

    setRegisterSubmitting(true)
    try {
      const created = await registerPatient(
        {
          patient_name: registerForm.name.trim(),
          date_of_birth: registerForm.dob,
          gender: registerForm.gender.toLowerCase(),
          address: registerForm.address ? registerForm.address.trim() : null,
          relationship_to_patient: registerForm.relationship || null,
          weight: Number(registerForm.weight),
          height: Number(registerForm.height),
        },
        accessToken
      )
      await loadPatients()
      setRegisterForm({
        name: '',
        dob: '',
        gender: 'Male',
        guardian: user?.guardianName || '',
        contact: user?.contactNumber || '',
        relationship: 'Mother',
        address: '',
        weight: '',
        height: '',
      })
      alert('Child successfully registered!')
      setActiveTab('Child Information')
    } catch (err) {
      setRegisterError(err.message || 'Could not register this child. Please try again.')
    } finally {
      setRegisterSubmitting(false)
    }
  }

  // Handle demographic update (Edit modal)
  async function handleUpdateChild(updates) {
    try {
      await updatePatient(
        editChild.id,
        {
          patient_name: updates.name,
          date_of_birth: updates.dob,
          gender: updates.gender.toLowerCase(),
          address: updates.address,
          weight: updates.weight === '' ? null : Number(updates.weight),
          height: updates.height === '' ? null : Number(updates.height),
        },
        accessToken
      )
      await loadPatients()
      setEditChild(null)
    } catch (err) {
      alert(err.message || 'Could not update this patient. Please try again.')
    }
  }

  // Handle Book Appointment -> writes live to Supabase!
  async function handleBookAppointment(e) {
    e.preventDefault()
    if (!bookForm.childId || !bookForm.date || !bookForm.doctorId || !bookForm.time) {
      alert('Please select a child, doctor, preferred date, and time slot.')
      return
    }

    try {
      setBookSubmitting(true)
      const payload = {
        patient_id: Number(bookForm.childId),
        doctor_id: Number(bookForm.doctorId),
        appointment_date: bookForm.date,
        appointment_time: bookForm.time.length === 5 ? `${bookForm.time}:00` : bookForm.time,
        reason_for_visit: `${bookForm.service}${bookForm.notes ? ': ' + bookForm.notes : ''}`,
      }

      await createAppointment(payload, accessToken)
      alert('Appointment successfully booked! It is now pending clinic confirmation.')
      await loadAppointments()
      setActiveTab('Appointments')
    } catch (err) {
      alert(err.message || 'Could not book appointment. Please try another slot.')
    } finally {
      setBookSubmitting(false)
    }
  }

  // Get this child's appointments, most relevant (soonest upcoming) first
  function getChildAppointments(childId) {
    return appointments
      .filter((a) => sameId(a.childId, childId))
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
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;800&display=swap');
        .kcc-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 26px; margin-bottom: 34px; }
        .kcc-card { position: relative; height: 130px; border-radius: 6px; overflow: hidden; cursor: pointer; display: flex; align-items: center; padding-left: 23px; color: #fff; font-family: 'Montserrat', sans-serif; background: linear-gradient(90deg, #76aff1 0%, #4f88d6 16%, #4177c3 50%, #2d5ca2 100%); box-shadow: 0 4px 8px rgba(0,0,0,.16); transition: transform .15s ease, box-shadow .15s ease; }
        .kcc-card:hover { transform: translateY(-2px); box-shadow: 0 8px 16px rgba(0,0,0,.22); }
        .kcc-text { position: relative; z-index: 2; }
        .kcc-num { font-size: 40px; font-weight: 800; line-height: 44px; }
        .kcc-label { width: min-content; font-size: 20px; font-weight: 500; line-height: 24px; }
        .kcc-icon { position: absolute; right: 0; bottom: 0; z-index: 1; }
        @media (max-width: 900px) { .kcc-cards { grid-template-columns: 1fr; } }
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
      <DashboardSidebar active={activeTab} />

      {/* MAIN CONTENT AREA */}
      <main className="dash-main">
        {/* Topbar */}
        <div className="dash-topbar">
          <h1 className="dash-title">{activeTab.toUpperCase()}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              onClick={() => {
                setShowMfaModal(true);
                setMfaStatusMsg('');
                setMfaErrorMsg('');
                setMfaData(null);
                setMfaCodeInput('');
                setMfaPasswordInput('');
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: userMfaEnabled ? '#ecfdf5' : '#f8fafc',
                color: userMfaEnabled ? '#059669' : '#475569',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <ShieldCheck size={16} color={userMfaEnabled ? '#059669' : '#64748b'} />
              {userMfaEnabled ? 'MFA: Enabled' : 'MFA: Disabled'}
            </button>
            <div className="dash-bell">
              <Bell size={20} />
              <span className="dash-bell-dot"></span>
            </div>
          </div>
        </div>

        {/* Quick Stat Cards (Hidden on Book Appointments and Register Child) */}
        {!['Book Appointments', 'Register Child'].includes(activeTab) && (
          <div className="kcc-cards">
            <div className="kcc-card" onClick={() => setActiveTab('Child Information')}>
              <div className="kcc-text">
                <div className="kcc-num">{children.length}</div>
                <div className="kcc-label">Children</div>
              </div>
              <svg className="kcc-icon" width="100" height="130" viewBox="0 0 100 130" aria-hidden="true">
                <rect x="24" y="27" width="54" height="57" rx="26" fill="#4588cd" />
                <path d="M0 130 C0 110 22 99 50 99 C78 99 100 110 100 130 Z" fill="#4588cd" />
              </svg>
            </div>

            <div className="kcc-card" onClick={() => setActiveTab('Appointments')}>
              <div className="kcc-text">
                <div className="kcc-num">{appointments.length}</div>
                <div className="kcc-label">Upcoming Appointment{appointments.length === 1 ? '' : 's'}</div>
              </div>
              <svg className="kcc-icon" width="100" height="130" viewBox="0 0 100 130" aria-hidden="true">
                <path d="M12 32 H89 A10 10 0 0 1 99 42 V130 H2 V42 A10 10 0 0 1 12 32 Z" fill="#4588cd" />
                <rect x="10" y="40" width="80" height="18" rx="3" fill="#3465ae" />
                <rect x="45" y="71" width="27" height="27" rx="7" fill="#3465ae" />
                <rect x="54.5" y="80.5" width="8" height="8" rx="1" fill="#4588cd" />
                <g fill="#3465ae">
                  <circle cx="31" cy="76" r="4" /><circle cx="85" cy="76" r="4" />
                  <circle cx="14" cy="93" r="4" /><circle cx="85" cy="93" r="4" />
                  <circle cx="14" cy="111" r="4" /><circle cx="31" cy="111" r="4" />
                  <circle cx="49" cy="111" r="4" /><circle cx="68" cy="111" r="4" />
                </g>
              </svg>
            </div>

            <div className="kcc-card" onClick={() => navigate('/payments')}>
              <div className="kcc-text">
                <div className="kcc-num">2</div>
                <div className="kcc-label">Pending Payments</div>
              </div>
              <svg className="kcc-icon" width="116" height="130" viewBox="0 0 116 130" aria-hidden="true">
                <path d="M13 42 H116 V130 H3 V52 A10 10 0 0 1 13 42 Z" fill="#4588cd" />
                <rect x="3" y="55" width="113" height="14" fill="#3768b1" />
                <rect x="16" y="77" width="35" height="5" rx="2" fill="#3768b1" />
              </svg>
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
                    <th>Patient Name</th>
                    <th>Doctor</th>
                    <th>Service / Reason</th>
                    <th>Date</th>
                    <th>Time Slot</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {appointmentsLoading ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', color: '#0284c7', padding: '24px' }}>
                        Loading live appointments from database…
                      </td>
                    </tr>
                  ) : appointments.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', color: '#999', padding: '24px' }}>
                        No appointments booked yet. Click "+ Book Another Appointment" below to schedule.
                      </td>
                    </tr>
                  ) : (
                    appointments.map((a) => {
                      const st = String(a.status || 'Pending').toLowerCase();
                      let badgeStyle = {
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontWeight: 700,
                        fontSize: '12px',
                        background: '#fef3c7',
                        color: '#b45309',
                      };
                      if (st === 'confirmed') {
                        badgeStyle = { padding: '4px 10px', borderRadius: '12px', fontWeight: 700, fontSize: '12px', background: '#e0f2fe', color: '#0369a1' };
                      } else if (st === 'completed') {
                        badgeStyle = { padding: '4px 10px', borderRadius: '12px', fontWeight: 700, fontSize: '12px', background: '#dcfce7', color: '#15803d' };
                      } else if (st === 'cancelled') {
                        badgeStyle = { padding: '4px 10px', borderRadius: '12px', fontWeight: 700, fontSize: '12px', background: '#fee2e2', color: '#b91c1c' };
                      }
                      return (
                        <tr key={a.id}>
                          <td><strong>{a.childName}</strong></td>
                          <td>{a.doctorName}</td>
                          <td>{formatServiceName(a.service)}</td>
                          <td>{a.date}</td>
                          <td>{a.time}</td>
                          <td>
                            <span style={badgeStyle}>
                              {a.status || 'Pending'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
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
                  placeholder="Search patients by name or guardian..."
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
                    <th>Name</th>
                    <th>Age</th>
                    <th>Gender</th>
                    <th>Weight</th>
                    <th>Height</th>
                    <th>Next Visit</th>
                    <th>Parent/Guardian</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {patientsLoading ? (
                    <tr><td colSpan={8} style={{ textAlign: 'center', color: '#999', padding: '28px' }}>Loading patients…</td></tr>
                  ) : patientsError ? (
                    <tr><td colSpan={8} style={{ textAlign: 'center', color: '#b3412c', padding: '28px' }}>{patientsError}</td></tr>
                  ) : filteredChildren.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', color: '#999', padding: '28px' }}>
                        No children registered yet.
                      </td>
                    </tr>
                  ) : (
                    filteredChildren.map((c) => (
                      <tr key={c.id}>
                        <td style={{ fontWeight: 600, color: 'var(--blue)' }}>{c.name}</td>
                        <td>{c.age}</td>
                        <td>{c.gender}</td>
                        <td>{c.weight}</td>
                        <td>{c.height}</td>
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
                          <button
                            className="dash-action-btn btn-action-book"
                            onClick={() => setEditChild(c)}
                          >
                            Edit
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
            {registerError && <p className="auth-error">{registerError}</p>}

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
                    max={todayLocal()}
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
                  <label>
                    Weight (kg): <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="e.g. 12.4"
                    value={registerForm.weight}
                    onChange={(e) => setRegisterForm({ ...registerForm, weight: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>
                    Height (cm): <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="e.g. 86"
                    value={registerForm.height}
                    onChange={(e) => setRegisterForm({ ...registerForm, height: e.target.value })}
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

              <div className="form-group">
                <label>Home Address:</label>
                <input
                  type="text"
                  placeholder="e.g. 123 Sampaguita St., Quezon City"
                  value={registerForm.address}
                  onChange={(e) => setRegisterForm({ ...registerForm, address: e.target.value })}
                />
              </div>

              <button type="submit" className="btn-book" style={{ marginTop: '12px' }} disabled={registerSubmitting}>
                {registerSubmitting ? 'Registering…' : 'Register Child'}
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
                          {c.name} (ID: {c.id})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>
                      Select Pediatrician / Doctor: <span className="required">*</span>
                    </label>
                    <select
                      value={bookForm.doctorId}
                      onChange={(e) => setBookForm({ ...bookForm, doctorId: e.target.value })}
                      required
                    >
                      <option value="" disabled>-- Choose a Doctor --</option>
                      {doctors.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.doctor_name || `Dr. Specialist #${d.id}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>
                        Service / Reason: <span className="required">*</span>
                      </label>
                      <select
                        value={bookForm.service}
                        onChange={(e) => setBookForm({ ...bookForm, service: e.target.value })}
                      >
                        <option value="General Pediatric Checkup">General Pediatric Checkup</option>
                        <option value="Vaccination & Immunization">Vaccination & Immunization</option>
                        <option value="Growth & Developmental Assessment">Growth & Developmental Assessment</option>
                        <option value="Urgent Consultation">Urgent Consultation</option>
                        <option value="Nutrition Counseling">Nutrition Counseling</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>
                        Preferred Date: <span className="required">*</span>
                      </label>
                      <input
                        type="date"
                        min={todayLocal()}
                        value={bookForm.date}
                        onChange={(e) => setBookForm({ ...bookForm, date: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>
                        Time Slot: {checkingSlots && <span style={{ fontSize: '11px', color: '#0284c7' }}>checking availability…</span>}
                      </label>
                      <select
                        value={bookForm.time}
                        onChange={(e) => setBookForm({ ...bookForm, time: e.target.value })}
                      >
                        {[
                          { val: '09:00', label: '09:00 AM - 10:00 AM' },
                          { val: '10:00', label: '10:00 AM - 11:00 AM' },
                          { val: '11:00', label: '11:00 AM - 12:00 PM' },
                          { val: '13:00', label: '01:00 PM - 02:00 PM' },
                          { val: '14:00', label: '02:00 PM - 03:00 PM' },
                          { val: '15:00', label: '03:00 PM - 04:00 PM' },
                          { val: '16:00', label: '04:00 PM - 05:00 PM' },
                        ].map((slot) => {
                          const isBooked = bookedSlots.includes(slot.val);
                          return (
                            <option key={slot.val} value={slot.val} disabled={isBooked}>
                              {slot.label} {isBooked ? '(Booked - Unavailable)' : '✓ Open'}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Parent / Guardian:</label>
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
                      placeholder="e.g. Mild fever since yesterday, routine booster vaccine"
                      value={bookForm.notes}
                      onChange={(e) => setBookForm({ ...bookForm, notes: e.target.value })}
                    />
                  </div>

                  <button type="submit" className="btn-book" disabled={bookSubmitting}>
                    {bookSubmitting ? 'Booking with Clinic…' : 'Confirm & Book Appointment'}
                  </button>
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
                        <td><strong>{children.find((c) => sameId(c.id, a.childId))?.name || a.childName}</strong></td>
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

      {/* MFA MANAGEMENT MODAL */}
      {showMfaModal && (
        <div
          className="confirm-overlay"
          onClick={() => setShowMfaModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <div
            className="confirm-box"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '460px',
              width: '90%',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={22} color="#0284c7" /> Two-Factor Authentication (MFA)
              </h3>
              <button
                type="button"
                onClick={() => setShowMfaModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            {mfaStatusMsg && (
              <div style={{ padding: '10px 14px', background: '#ecfdf5', color: '#065f46', borderRadius: '6px', marginBottom: '14px', fontSize: '13px' }}>
                {mfaStatusMsg}
              </div>
            )}
            {mfaErrorMsg && (
              <div style={{ padding: '10px 14px', background: '#fef2f2', color: '#991b1b', borderRadius: '6px', marginBottom: '14px', fontSize: '13px' }}>
                {mfaErrorMsg}
              </div>
            )}

            {!userMfaEnabled ? (
              <div>
                {!mfaData ? (
                  <div>
                    <p style={{ color: '#475569', fontSize: '14px', lineHeight: 1.5, marginBottom: '18px' }}>
                      Add an extra layer of security to your KiddoCare guardian account. Once enabled, you will need a 6-digit TOTP code from your authenticator app (Google Authenticator, Authy, Microsoft Authenticator) whenever you sign in.
                    </p>
                    <button
                      type="button"
                      className="btn-primary"
                      style={{ width: '100%' }}
                      onClick={async () => {
                        setMfaErrorMsg('');
                        try {
                          const res = await setupMfa(accessToken);
                          setMfaData(res);
                        } catch (err) {
                          setMfaErrorMsg(err.message || 'Failed to start MFA setup.');
                        }
                      }}
                    >
                      Begin MFA Setup
                    </button>
                  </div>
                ) : (
                  <div>
                    <p style={{ fontSize: '13px', color: '#475569', marginBottom: '12px' }}>
                      Scan the QR code below with your Authenticator app, then enter the generated 6-digit code:
                    </p>
                    <div style={{ textAlign: 'center', marginBottom: '14px' }}>
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(mfaData.otpauth_url)}&size=180x180`}
                        alt="MFA QR Code"
                        style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '6px' }}
                      />
                      <div style={{ marginTop: '6px', fontSize: '12px', color: '#64748b' }}>
                        Manual key: <code style={{ fontWeight: 700, letterSpacing: '1px' }}>{mfaData.secret}</code>
                      </div>
                    </div>
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        setMfaErrorMsg('');
                        try {
                          await confirmMfa(mfaCodeInput.trim(), accessToken);
                          setUserMfaEnabled(true);
                          setMfaStatusMsg('Two-Factor Authentication is now enabled for your account!');
                          setMfaData(null);
                        } catch (err) {
                          setMfaErrorMsg(err.message || 'Invalid code. Check your authenticator app.');
                        }
                      }}
                    >
                      <div className="form-group" style={{ marginBottom: '14px' }}>
                        <label style={{ fontSize: '13px', fontWeight: 600 }}>6-Digit Verification Code:</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          placeholder="e.g. 123456"
                          required
                          value={mfaCodeInput}
                          onChange={(e) => setMfaCodeInput(e.target.value)}
                          style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '16px', letterSpacing: '2px', textAlign: 'center' }}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                          Verify & Activate
                        </button>
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => setMfaData(null)}
                          style={{ padding: '8px 14px' }}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: '#ecfdf5', borderRadius: '8px', marginBottom: '16px' }}>
                  <ShieldCheck size={24} color="#059669" />
                  <div>
                    <strong style={{ color: '#065f46', fontSize: '14px' }}>MFA is currently active</strong>
                    <div style={{ color: '#047857', fontSize: '12px' }}>Your account is protected with two-step verification.</div>
                  </div>
                </div>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!mfaPasswordInput) return;
                    setMfaErrorMsg('');
                    try {
                      await disableMfa(mfaPasswordInput, accessToken);
                      setUserMfaEnabled(false);
                      setMfaPasswordInput('');
                      setMfaStatusMsg('Two-Factor Authentication has been disabled.');
                    } catch (err) {
                      setMfaErrorMsg(err.message || 'Incorrect password.');
                    }
                  }}
                >
                  <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>
                    To disable MFA, enter your account password to confirm:
                  </p>
                  <div className="form-group" style={{ marginBottom: '14px' }}>
                    <input
                      type="password"
                      placeholder="Enter your account password"
                      required
                      value={mfaPasswordInput}
                      onChange={(e) => setMfaPasswordInput(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  <button type="submit" className="btn-primary" style={{ width: '100%', background: '#dc2626' }}>
                    Disable Two-Factor Authentication
                  </button>
                </form>
              </div>
            )}
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

      {/* Demographic update modal — PUT /api/patients/:id */}
      {editChild && (
        <EditChildModal
          child={editChild}
          onClose={() => setEditChild(null)}
          onSave={handleUpdateChild}
        />
      )}
    </div>
  )
}