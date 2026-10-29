import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Users, Calendar, CreditCard, Search, Plus, Eye, Pencil, Trash2, X, AlertCircle,
  ClipboardList, Syringe, FileText, BarChart2, Check
} from 'lucide-react'
import AdminSidebar from '../components/AdminSidebar.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import {
  listAppointments,
  getAppointment,
  checkAvailability,
  createAppointment,
  updateAppointmentStatus,
  rescheduleAppointment,
  listDoctors,
  listMyPatients,
} from '../lib/api.js'
import {
  Clock, RefreshCw, Filter, CheckCircle2
} from 'lucide-react'

const DEMO_ADMIN_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZjUwMDIxOTctNzY2Ny00M2Q1LWJiZDMtOTY4OTQ2MmM5YjdhIiwidXNlcm5hbWUiOiJhZG1pbiIsInJvbGUiOiJhZG1pbiIsImVtYWlsIjoiYWRtaW5AZ21haWwuY29tIiwiaWF0IjoxNzkzMjk2NDc3LCJleHAiOjE3OTU4ODg0Nzd9.ryCi963Ho7PRHqfvhXiDWLlXcU3zqszFZVdZX-RzrZQ'

const INIT_PATIENTS = [
  { id:'KC-001', name:'Lhea Santos',   age:'2 years', gender:'Female', nextVisit:'2025-11-11', guardian:'Emma Santos'     },
  { id:'KC-002', name:'Johny Tan',     age:'3 years', gender:'Male',   nextVisit:'2025-08-20', guardian:'Felicia Tan'     },
  { id:'KC-003', name:'Kyla Mae Yap',  age:'1 year',  gender:'Female', nextVisit:'2025-12-08', guardian:'Arnold Jay Yap'  },
  { id:'KC-004', name:'Sofia Andrade', age:'5 years', gender:'Female', nextVisit:'2026-03-02', guardian:'Justine Andrade' },
  { id:'KC-005', name:'Ian Murillo',   age:'3 years', gender:'Male',   nextVisit:'2025-09-25', guardian:'Carlo Murillo'   },
  { id:'KC-006', name:'Gwyneth Tan',   age:'2 years', gender:'Female', nextVisit:'2026-02-18', guardian:'Kzel Tan'        },
]
const INIT_USERS = [
  { id:'U-001', name:'Dra. Maury V. Reyes',    role:'Doctor', email:'mvr@clinic.com',  status:'Active' },
  { id:'U-002', name:'Sheun Georrel Pre',       role:'Admin',  email:'sgp@clinic.com',  status:'Active' },
  { id:'U-003', name:'Sean Patrick Petero',     role:'Staff',  email:'spp@clinic.com',  status:'Active' },
  { id:'U-004', name:'Dr. Christian J. Mauricio',role:'Doctor',email:'cjm@clinic.com', status:'Active' },
]
const INIT_RECORDS = [
  { id:'MR-001', patient:'Lhea Santos',   date:'2025-08-15', diagnosis:'Upper Respiratory Infection', doctor:'Dra. Maury V. Reyes'    },
  { id:'MR-002', patient:'Johny Tan',     date:'2025-07-20', diagnosis:'Viral Gastroenteritis',        doctor:'Dr. Christian J. Mauricio' },
  { id:'MR-003', patient:'Kyla Mae Yap',  date:'2025-09-02', diagnosis:'Routine Checkup',              doctor:'Dra. Maury V. Reyes'    },
  { id:'MR-004', patient:'Sofia Andrade', date:'2025-09-10', diagnosis:'Bronchitis',                   doctor:'Dra. Maury V. Reyes'    },
]
const INIT_APPTS = [
  { id:'AP-001', patient:'Lhea Santos',   date:'2025-11-11', time:'09:00 AM', service:'General Checkup', doctor:'Dra. Maury V. Reyes',     status:'Confirmed' },
  { id:'AP-002', patient:'Johny Tan',     date:'2025-08-20', time:'10:00 AM', service:'Vaccination',     doctor:'Dr. Christian J. Mauricio', status:'Confirmed' },
  { id:'AP-003', patient:'Kyla Mae Yap',  date:'2025-12-08', time:'11:00 AM', service:'Follow-up',       doctor:'Dra. Maury V. Reyes',     status:'Pending'   },
  { id:'AP-004', patient:'Sofia Andrade', date:'2026-03-02', time:'02:00 PM', service:'General Checkup', doctor:'Dra. Maury V. Reyes',     status:'Confirmed' },
]
const INIT_VACC = [
  { id:'V-001', patient:'Lhea Santos',   vaccine:'BCG',        date:'2023-06-01', status:'Completed' },
  { id:'V-002', patient:'Lhea Santos',   vaccine:'Hepatitis B', date:'2023-07-05', status:'Completed' },
  { id:'V-003', patient:'Johny Tan',     vaccine:'MMR',         date:'2023-09-12', status:'Completed' },
  { id:'V-004', patient:'Kyla Mae Yap',  vaccine:'Varicella',   date:'2024-01-20', status:'Pending'   },
  { id:'V-005', patient:'Sofia Andrade', vaccine:'DTaP',        date:'2024-03-14', status:'Completed' },
]
const INIT_PAYMENTS = [
  { id:'PAY-001', patient:'Lhea Santos',   amount:'₱500',  date:'2025-08-15', service:'Consultation', status:'Paid'    },
  { id:'PAY-002', patient:'Johny Tan',     amount:'₱800',  date:'2025-07-20', service:'Vaccination',  status:'Paid'    },
  { id:'PAY-003', patient:'Kyla Mae Yap',  amount:'₱500',  date:'2025-09-02', service:'Consultation', status:'Pending' },
  { id:'PAY-004', patient:'Sofia Andrade', amount:'₱1200', date:'2025-09-10', service:'Lab Test',     status:'Pending' },
  { id:'PAY-005', patient:'Ian Murillo',   amount:'₱600',  date:'2025-09-25', service:'Consultation', status:'Pending' },
  { id:'PAY-006', patient:'Gwyneth Tan',   amount:'₱500',  date:'2026-02-18', service:'Consultation', status:'Pending' },
]
const INIT_PRESCRIPTIONS = [
  { id:'RX-001', patient:'Lhea Santos',   medication:'Amoxicillin 250mg',  dosage:'3x daily for 7 days',  doctor:'Dra. Maury V. Reyes',      date:'2025-08-15' },
  { id:'RX-002', patient:'Johny Tan',     medication:'Paracetamol 250mg',  dosage:'Every 4-6 hrs PRN',    doctor:'Dr. Christian J. Mauricio', date:'2025-07-20' },
  { id:'RX-003', patient:'Sofia Andrade', medication:'Salbutamol Inhaler', dosage:'2 puffs every 4-6 hrs',doctor:'Dra. Maury V. Reyes',      date:'2025-09-10' },
]

function fmt(d) {
  if (!d) return '—'
  const dt = new Date(d + 'T00:00:00')
  return dt.toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })
}

function Overlay({ onClose, children }) {
  return (
    <div className="adm-overlay" onClick={onClose}>
      <div className="adm-modal" onClick={e => e.stopPropagation()}>{children}</div>
    </div>
  )
}
function ModalHdr({ title, onClose }) {
  return (
    <div className="adm-modal-hdr">
      <span>{title}</span>
      <button className="adm-modal-close" onClick={onClose}><X size={20}/></button>
    </div>
  )
}
function Field({ label, children }) {
  return <div className="adm-field"><label>{label}</label>{children}</div>
}
function RO({ val }) { return <div className="adm-ro">{val}</div> }
function Inp({ value, onChange, type='text', placeholder='' }) {
  return <input className="adm-inp" type={type} value={value} onChange={onChange} placeholder={placeholder} required />
}
function SubmitBtn({ label }) { return <button type="submit" className="adm-submit">{label}</button> }
function StatusBadge({ status }) {
  const colors = {
    Active:'#d1fae5|#065f46', Paid:'#d1fae5|#065f46', Completed:'#d1fae5|#065f46',
    Pending:'#fef3c7|#92400e', Confirmed:'#dbeafe|#1d4ed8', Inactive:'#fee2e2|#b91c1c',
    Cancelled:'#fee2e2|#b91c1c',
  }
  const [bg, color] = (colors[status] || '#f1f5f9|#374151').split('|')
  return <span style={{ background: bg, color, borderRadius:20, padding:'3px 12px', fontSize:12, fontWeight:700 }}>{status}</span>
}
function DeleteConfirm({ onCancel, onDelete }) {
  return (
    <div className="adm-del-body">
      <div className="adm-del-icon"><AlertCircle size={38} color="#7b1717"/></div>
      <div className="adm-del-title">Delete the Information?</div>
      <div className="adm-del-sub">Are you sure you want to delete this record?</div>
      <div className="adm-del-btns">
        <button className="adm-btn-cancel" onClick={onCancel}>Cancel</button>
        <button className="adm-btn-confirm" onClick={onDelete}>Delete</button>
      </div>
    </div>
  )
}

const ICONS = {
  child: (
    <svg className="kcc-icon" width="100" height="130" viewBox="0 0 100 130" aria-hidden="true">
      <rect x="24" y="27" width="54" height="57" rx="26" fill="#4588cd" />
      <path d="M0 130 C0 110 22 99 50 99 C78 99 100 110 100 130 Z" fill="#4588cd" />
    </svg>
  ),
  calendar: (
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
  ),
  payment: (
    <svg className="kcc-icon" width="116" height="130" viewBox="0 0 116 130" aria-hidden="true">
      <path d="M13 42 H116 V130 H3 V52 A10 10 0 0 1 13 42 Z" fill="#4588cd" />
      <rect x="3" y="55" width="113" height="14" fill="#3768b1" />
      <rect x="16" y="77" width="35" height="5" rx="2" fill="#3768b1" />
    </svg>
  ),
  vaccine: (
    <svg className="kcc-icon" width="100" height="130" viewBox="0 0 100 130" aria-hidden="true">
      <g transform="rotate(35 50 85)">
        <rect x="38" y="40" width="24" height="70" rx="5" fill="#4588cd" />
        <rect x="30" y="34" width="40" height="8" rx="3" fill="#3465ae" />
        <rect x="47" y="14" width="6" height="22" fill="#3465ae" />
        <rect x="46" y="110" width="8" height="20" fill="#3465ae" />
      </g>
    </svg>
  ),
}

function StatCard({ num, label, icon, onClick }) {
  return (
    <div className="kcc-card" onClick={onClick}>
      <div className="kcc-text">
        <div className="kcc-num">{num}</div>
        <div className="kcc-label">{label}</div>
      </div>
      {ICONS[icon]}
    </div>
  )
}

function PanelHead({ icon: Icon, title, search, setSearch, onAdd, addLabel='Add New' }) {
  return (
    <div className="adm-panel-head">
      <div className="adm-panel-title"><Icon size={20}/>{title}</div>
      <div style={{ display:'flex', gap:10, alignItems:'center', flex:1, justifyContent:'flex-end', flexWrap:'wrap' }}>
        <div className="adm-search">
          <Search size={15} color="#9ca3af"/>
          <input placeholder="Search…" value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        {onAdd && <button className="adm-add-btn" onClick={onAdd}><Plus size={14}/> {addLabel}</button>}
      </div>
    </div>
  )
}

function GenderToggle({ value, onChange }) {
  return (
    <div className="adm-gender-row">
      {['Male','Female'].map(g => (
        <div key={g}
          className={`adm-gender-opt${value===g?' sel':''}`}
          onClick={()=>onChange(g)}>
          <span style={{fontSize:20}}>{g==='Male'?'♂':'♀'}</span>{g}
        </div>
      ))}
    </div>
  )
}

function SectionDashboard({ patients, onNavigate }) {
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd]       = useState(false)
  const [viewP,   setViewP]         = useState(null)
  const [editP,   setEditP]         = useState(null)
  const [deleteP, setDeleteP]       = useState(null)
  const { accessToken } = useAuth()
  const token = accessToken || localStorage.getItem('kiddocare-token') || DEMO_ADMIN_TOKEN
  const [rows, setRows]             = useState(patients)
  const [liveApptCount, setLiveApptCount] = useState(0)

  useEffect(() => {
    async function fetchCounts() {
      try {
        const [appts, pats] = await Promise.all([
          listAppointments(token).catch(() => []),
          listMyPatients(token).catch(() => []),
        ])
        if (Array.isArray(appts)) setLiveApptCount(appts.length)
        if (Array.isArray(pats) && pats.length > 0) {
          setRows(pats.map(p => ({
            id: `KC-${String(p.id).padStart(3, '0')}`,
            name: p.patient_name,
            age: p.date_of_birth || 'N/A',
            gender: p.gender ? p.gender[0].toUpperCase() + p.gender.slice(1) : 'Male',
            nextVisit: '—',
            guardian: 'Registered Guardian',
          })))
        }
      } catch (e) {}
    }
    fetchCounts()
  }, [token])

  const [addF, setAddF] = useState({ name:'', age:'', gender:'Male', nextVisit:'', guardian:'' })
  const [editF, setEditF] = useState({ name:'', age:'', gender:'Male', nextVisit:'', guardian:'' })

  const filtered = rows.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.id.toLowerCase().includes(search.toLowerCase())
  )

  function doAdd(e) {
    e.preventDefault()
    const id = `KC-${String(rows.length+1).padStart(3,'0')}`
    setRows([...rows, { id, ...addF }])
    setAddF({ name:'', age:'', gender:'Male', nextVisit:'', guardian:'' })
    setShowAdd(false)
  }
  function doEdit(e) {
    e.preventDefault()
    setRows(rows.map(r => r.id===editP.id ? { ...r, ...editF } : r))
    setEditP(null)
  }
  function doDelete() { setRows(rows.filter(r=>r.id!==deleteP.id)); setDeleteP(null) }

  return (
    <>
      <div className="kcc-cards">
        <StatCard num={rows.length} label="Patients" icon="child" onClick={()=>onNavigate('Patient Management')} />
        <StatCard num={liveApptCount} label="Appointments" icon="calendar" onClick={()=>onNavigate('Appointments')} />
        <StatCard num={6} label="Pending Payments" icon="payment" onClick={()=>onNavigate('Payments')} />
      </div>

      <div className="adm-panel">
        <PanelHead icon={Users} title="Children" search={search} setSearch={setSearch} onAdd={()=>setShowAdd(true)} />
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead><tr>
              <th>PatientId</th><th>Name</th><th>Age</th><th>Gender</th>
              <th>Next Visit</th><th>Parent/Guardian</th><th>Actions</th>
            </tr></thead>
            <tbody>
              {filtered.map(p=>(
                <tr key={p.id}>
                  <td>{p.id}</td><td>{p.name}</td><td>{p.age}</td><td>{p.gender}</td>
                  <td>{fmt(p.nextVisit)}</td><td>{p.guardian}</td>
                  <td>
                    <div className="adm-actions">
                      <button className="adm-btn-view"   onClick={()=>setViewP(p)}><Eye size={17}/></button>
                      <button className="adm-btn-edit"   onClick={()=>{ setEditP(p); setEditF({name:p.name,age:p.age,gender:p.gender,nextVisit:p.nextVisit,guardian:p.guardian}) }}><Pencil size={16}/></button>
                      <button className="adm-btn-delete" onClick={()=>setDeleteP(p)}><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filtered.length && <tr><td colSpan={7} style={{textAlign:'center',color:'#9ca3af',padding:24}}>No patients found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && <Overlay onClose={()=>setShowAdd(false)}>
        <ModalHdr title="Add New Child" onClose={()=>setShowAdd(false)}/>
        <div className="adm-modal-body"><form onSubmit={doAdd}>
          <Field label="Patient Name:"><Inp value={addF.name} placeholder="Enter the Patient's Name" onChange={e=>setAddF({...addF,name:e.target.value})}/></Field>
          <Field label="Patient Age:"><Inp value={addF.age}  placeholder="Enter the Patient's Age"  onChange={e=>setAddF({...addF,age:e.target.value})}/></Field>
          <Field label="Gender"><GenderToggle value={addF.gender} onChange={g=>setAddF({...addF,gender:g})}/></Field>
          <Field label="Next Visit:"><Inp type="date" value={addF.nextVisit} onChange={e=>setAddF({...addF,nextVisit:e.target.value})}/></Field>
          <Field label="Parent/Guardian's Name:"><Inp value={addF.guardian} placeholder="Enter the Parent/Guardian's Name" onChange={e=>setAddF({...addF,guardian:e.target.value})}/></Field>
          <SubmitBtn label="Add"/>
        </form></div>
      </Overlay>}

      {viewP && <Overlay onClose={()=>setViewP(null)}>
        <ModalHdr title="View Information" onClose={()=>setViewP(null)}/>
        <div className="adm-modal-body">
          <Field label="Patient ID:"><RO val={viewP.id}/></Field>
          <Field label="Patient Name:"><RO val={viewP.name}/></Field>
          <div className="adm-field-row">
            <Field label="Age:"><RO val={viewP.age}/></Field>
            <Field label="Gender"><GenderToggle value={viewP.gender} onChange={()=>{}}/></Field>
          </div>
          <Field label="Next Visit:"><RO val={viewP.nextVisit}/></Field>
          <Field label="Patient's Guardian:"><RO val={viewP.guardian}/></Field>
        </div>
      </Overlay>}

      {editP && <Overlay onClose={()=>setEditP(null)}>
        <ModalHdr title="Edit Information" onClose={()=>setEditP(null)}/>
        <div className="adm-modal-body"><form onSubmit={doEdit}>
          <Field label="Patient ID:"><RO val={editP.id}/></Field>
          <Field label="Patient Name:"><Inp value={editF.name} onChange={e=>setEditF({...editF,name:e.target.value})}/></Field>
          <div className="adm-field-row">
            <Field label="Age:"><Inp value={editF.age} onChange={e=>setEditF({...editF,age:e.target.value})}/></Field>
            <Field label="Gender"><GenderToggle value={editF.gender} onChange={g=>setEditF({...editF,gender:g})}/></Field>
          </div>
          <Field label="Next Visit:"><Inp type="date" value={editF.nextVisit} onChange={e=>setEditF({...editF,nextVisit:e.target.value})}/></Field>
          <Field label="Patient's Guardian:"><Inp value={editF.guardian} onChange={e=>setEditF({...editF,guardian:e.target.value})}/></Field>
          <SubmitBtn label="Edit"/>
        </form></div>
      </Overlay>}

      {deleteP && <Overlay onClose={()=>setDeleteP(null)}>
        <ModalHdr title="Delete Information" onClose={()=>setDeleteP(null)}/>
        <DeleteConfirm onCancel={()=>setDeleteP(null)} onDelete={doDelete}/>
      </Overlay>}
    </>
  )
}

function SectionUserMgmt() {
  const [rows, setRows]     = useState(INIT_USERS)
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [viewU,   setViewU]   = useState(null)
  const [deleteU, setDeleteU] = useState(null)
  const [addF, setAddF] = useState({ name:'', role:'Doctor', email:'', status:'Active' })

  const filtered = rows.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.email.toLowerCase().includes(search.toLowerCase())
  )

  function doAdd(e) {
    e.preventDefault()
    setRows([...rows, { id:`U-${String(rows.length+1).padStart(3,'0')}`, ...addF }])
    setAddF({ name:'', role:'Doctor', email:'', status:'Active' }); setShowAdd(false)
  }
  function doDelete() { setRows(rows.filter(r=>r.id!==deleteU.id)); setDeleteU(null) }

  return (
    <>
      <div className="adm-panel">
        <PanelHead icon={Users} title="System Users" search={search} setSearch={setSearch} onAdd={()=>setShowAdd(true)}/>
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead><tr><th>Name</th><th>Role</th><th>Email</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(u=>(
                <tr key={u.id}>
                  <td>{u.name}</td><td>{u.role}</td><td>{u.email}</td>
                  <td><StatusBadge status={u.status}/></td>
                  <td>
                    <div className="adm-actions">
                      <button className="adm-add-btn" style={{padding:'5px 18px', fontSize:13}} onClick={()=>setViewU(u)}>View</button>
                      <button className="adm-btn-delete" onClick={()=>setDeleteU(u)}><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && <Overlay onClose={()=>setShowAdd(false)}>
        <ModalHdr title="Add New User" onClose={()=>setShowAdd(false)}/>
        <div className="adm-modal-body"><form onSubmit={doAdd}>
          <Field label="Full Name:"><Inp value={addF.name} placeholder="Full name" onChange={e=>setAddF({...addF,name:e.target.value})}/></Field>
          <Field label="Role:">
            <select className="adm-inp" value={addF.role} onChange={e=>setAddF({...addF,role:e.target.value})}>
              {['Doctor','Admin','Staff'].map(r=><option key={r}>{r}</option>)}
            </select>
          </Field>
          <Field label="Email:"><Inp type="email" value={addF.email} placeholder="email@clinic.com" onChange={e=>setAddF({...addF,email:e.target.value})}/></Field>
          <Field label="Status:">
            <select className="adm-inp" value={addF.status} onChange={e=>setAddF({...addF,status:e.target.value})}>
              <option>Active</option><option>Inactive</option>
            </select>
          </Field>
          <SubmitBtn label="Add User"/>
        </form></div>
      </Overlay>}

      {viewU && <Overlay onClose={()=>setViewU(null)}>
        <ModalHdr title="User Information" onClose={()=>setViewU(null)}/>
        <div className="adm-modal-body">
          <Field label="Name:"><RO val={viewU.name}/></Field>
          <Field label="Role:"><RO val={viewU.role}/></Field>
          <Field label="Email:"><RO val={viewU.email}/></Field>
          <Field label="Status:"><StatusBadge status={viewU.status}/></Field>
        </div>
      </Overlay>}

      {deleteU && <Overlay onClose={()=>setDeleteU(null)}>
        <ModalHdr title="Delete User" onClose={()=>setDeleteU(null)}/>
        <DeleteConfirm onCancel={()=>setDeleteU(null)} onDelete={doDelete}/>
      </Overlay>}
    </>
  )
}

function SectionPatientMgmt() {
  const [rows, setRows]     = useState(INIT_PATIENTS)
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [viewP,   setViewP]   = useState(null)
  const [editP,   setEditP]   = useState(null)
  const [deleteP, setDeleteP] = useState(null)
  const [addF, setAddF]  = useState({ name:'', age:'', gender:'Male', nextVisit:'', guardian:'' })
  const [editF, setEditF]= useState({ name:'', age:'', gender:'Male', nextVisit:'', guardian:'' })

  const filtered = rows.filter(r => r.name.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase()))

  function doAdd(e) {
    e.preventDefault()
    setRows([...rows, { id:`KC-${String(rows.length+1).padStart(3,'0')}`, ...addF }])
    setAddF({ name:'', age:'', gender:'Male', nextVisit:'', guardian:'' }); setShowAdd(false)
  }
  function doEdit(e) { e.preventDefault(); setRows(rows.map(r=>r.id===editP.id?{...r,...editF}:r)); setEditP(null) }
  function doDelete() { setRows(rows.filter(r=>r.id!==deleteP.id)); setDeleteP(null) }

  return (
    <>
      <div className="adm-panel">
        <PanelHead icon={Users} title="All Patients" search={search} setSearch={setSearch} onAdd={()=>setShowAdd(true)}/>
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead><tr><th>PatientId</th><th>Name</th><th>Age</th><th>Gender</th><th>Next Visit</th><th>Parent/Guardian</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(p=>(
                <tr key={p.id}>
                  <td>{p.id}</td><td>{p.name}</td><td>{p.age}</td><td>{p.gender}</td>
                  <td>{fmt(p.nextVisit)}</td><td>{p.guardian}</td>
                  <td><div className="adm-actions">
                    <button className="adm-btn-view" onClick={()=>setViewP(p)}><Eye size={17}/></button>
                    <button className="adm-btn-edit" onClick={()=>{ setEditP(p); setEditF({name:p.name,age:p.age,gender:p.gender,nextVisit:p.nextVisit,guardian:p.guardian}) }}><Pencil size={16}/></button>
                    <button className="adm-btn-delete" onClick={()=>setDeleteP(p)}><Trash2 size={16}/></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {showAdd && <Overlay onClose={()=>setShowAdd(false)}><ModalHdr title="Add Patient" onClose={()=>setShowAdd(false)}/>
        <div className="adm-modal-body"><form onSubmit={doAdd}>
          <Field label="Patient Name:"><Inp value={addF.name} placeholder="Name" onChange={e=>setAddF({...addF,name:e.target.value})}/></Field>
          <Field label="Patient Age:"><Inp value={addF.age} placeholder="e.g. 2 years" onChange={e=>setAddF({...addF,age:e.target.value})}/></Field>
          <Field label="Gender"><GenderToggle value={addF.gender} onChange={g=>setAddF({...addF,gender:g})}/></Field>
          <Field label="Next Visit:"><Inp type="date" value={addF.nextVisit} onChange={e=>setAddF({...addF,nextVisit:e.target.value})}/></Field>
          <Field label="Parent/Guardian:"><Inp value={addF.guardian} placeholder="Guardian name" onChange={e=>setAddF({...addF,guardian:e.target.value})}/></Field>
          <SubmitBtn label="Add"/>
        </form></div>
      </Overlay>}
      {viewP && <Overlay onClose={()=>setViewP(null)}><ModalHdr title="View Patient" onClose={()=>setViewP(null)}/>
        <div className="adm-modal-body">
          <Field label="Patient ID:"><RO val={viewP.id}/></Field>
          <Field label="Name:"><RO val={viewP.name}/></Field>
          <div className="adm-field-row">
            <Field label="Age:"><RO val={viewP.age}/></Field>
            <Field label="Gender"><GenderToggle value={viewP.gender} onChange={()=>{}}/></Field>
          </div>
          <Field label="Next Visit:"><RO val={viewP.nextVisit}/></Field>
          <Field label="Guardian:"><RO val={viewP.guardian}/></Field>
        </div>
      </Overlay>}
      {editP && <Overlay onClose={()=>setEditP(null)}><ModalHdr title="Edit Patient" onClose={()=>setEditP(null)}/>
        <div className="adm-modal-body"><form onSubmit={doEdit}>
          <Field label="Patient ID:"><RO val={editP.id}/></Field>
          <Field label="Patient Name:"><Inp value={editF.name} onChange={e=>setEditF({...editF,name:e.target.value})}/></Field>
          <div className="adm-field-row">
            <Field label="Age:"><Inp value={editF.age} onChange={e=>setEditF({...editF,age:e.target.value})}/></Field>
            <Field label="Gender"><GenderToggle value={editF.gender} onChange={g=>setEditF({...editF,gender:g})}/></Field>
          </div>
          <Field label="Next Visit:"><Inp type="date" value={editF.nextVisit} onChange={e=>setEditF({...editF,nextVisit:e.target.value})}/></Field>
          <Field label="Guardian:"><Inp value={editF.guardian} onChange={e=>setEditF({...editF,guardian:e.target.value})}/></Field>
          <SubmitBtn label="Edit"/>
        </form></div>
      </Overlay>}
      {deleteP && <Overlay onClose={()=>setDeleteP(null)}><ModalHdr title="Delete Patient" onClose={()=>setDeleteP(null)}/>
        <DeleteConfirm onCancel={()=>setDeleteP(null)} onDelete={doDelete}/>
      </Overlay>}
    </>
  )
}

function SectionMedicalRecords() {
  const [rows, setRows]     = useState(INIT_RECORDS)
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [viewR,   setViewR]   = useState(null)
  const [deleteR, setDeleteR] = useState(null)
  const [addF, setAddF]= useState({ patient:'', date:'', diagnosis:'', doctor:'' })

  const filtered = rows.filter(r=>r.patient.toLowerCase().includes(search.toLowerCase())||r.diagnosis.toLowerCase().includes(search.toLowerCase()))

  function doAdd(e) { e.preventDefault(); setRows([...rows,{id:`MR-${String(rows.length+1).padStart(3,'0')}`, ...addF}]); setAddF({patient:'',date:'',diagnosis:'',doctor:''}); setShowAdd(false) }
  function doDelete() { setRows(rows.filter(r=>r.id!==deleteR.id)); setDeleteR(null) }

  return (
    <>
      <div className="adm-panel">
        <PanelHead icon={ClipboardList} title="Medical Records" search={search} setSearch={setSearch} onAdd={()=>setShowAdd(true)}/>
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead><tr><th>Record ID</th><th>Patient</th><th>Date</th><th>Diagnosis</th><th>Doctor</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(r=>(
                <tr key={r.id}>
                  <td>{r.id}</td><td>{r.patient}</td><td>{fmt(r.date)}</td><td>{r.diagnosis}</td><td>{r.doctor}</td>
                  <td><div className="adm-actions">
                    <button className="adm-btn-view" onClick={()=>setViewR(r)}><Eye size={17}/></button>
                    <button className="adm-btn-delete" onClick={()=>setDeleteR(r)}><Trash2 size={16}/></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {showAdd && <Overlay onClose={()=>setShowAdd(false)}><ModalHdr title="Add Medical Record" onClose={()=>setShowAdd(false)}/>
        <div className="adm-modal-body"><form onSubmit={doAdd}>
          <Field label="Patient Name:"><Inp value={addF.patient} placeholder="Patient name" onChange={e=>setAddF({...addF,patient:e.target.value})}/></Field>
          <Field label="Date:"><Inp type="date" value={addF.date} onChange={e=>setAddF({...addF,date:e.target.value})}/></Field>
          <Field label="Diagnosis:"><Inp value={addF.diagnosis} placeholder="Diagnosis" onChange={e=>setAddF({...addF,diagnosis:e.target.value})}/></Field>
          <Field label="Doctor:"><Inp value={addF.doctor} placeholder="Attending doctor" onChange={e=>setAddF({...addF,doctor:e.target.value})}/></Field>
          <SubmitBtn label="Add Record"/>
        </form></div>
      </Overlay>}
      {viewR && <Overlay onClose={()=>setViewR(null)}><ModalHdr title="Medical Record" onClose={()=>setViewR(null)}/>
        <div className="adm-modal-body">
          <Field label="Record ID:"><RO val={viewR.id}/></Field>
          <Field label="Patient:"><RO val={viewR.patient}/></Field>
          <Field label="Date:"><RO val={fmt(viewR.date)}/></Field>
          <Field label="Diagnosis:"><RO val={viewR.diagnosis}/></Field>
          <Field label="Doctor:"><RO val={viewR.doctor}/></Field>
        </div>
      </Overlay>}
      {deleteR && <Overlay onClose={()=>setDeleteR(null)}><ModalHdr title="Delete Record" onClose={()=>setDeleteR(null)}/>
        <DeleteConfirm onCancel={()=>setDeleteR(null)} onDelete={doDelete}/>
      </Overlay>}
    </>
  )
}

const STANDARD_TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00'
];

function formatTimeDisplay(t) {
  if (!t) return '—';
  const match = String(t).match(/^(\d{1,2}):(\d{2})/);
  if (!match) return t;
  let h = parseInt(match[1], 10);
  const m = match[2];
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${String(h).padStart(2, '0')}:${m} ${ampm}`;
}

function SectionAppointments() {
  const { accessToken } = useAuth();
  const token = accessToken || localStorage.getItem('kiddocare-token') || DEMO_ADMIN_TOKEN;

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);

  // Filter States
  const [search, setSearch] = useState('');
  const [filterDoctor, setFilterDoctor] = useState('');
  const [filterPatient, setFilterPatient] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [dateMode, setDateMode] = useState('single'); // 'single' or 'range'
  const [filterDate, setFilterDate] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  // Modals
  const [showAdd, setShowAdd] = useState(false);
  const [viewA, setViewA] = useState(null);
  const [loadingView, setLoadingView] = useState(false);
  const [rescheduleA, setRescheduleA] = useState(null);
  const [cancelA, setCancelA] = useState(null);

  // Add Appointment Form State
  const [addF, setAddF] = useState({
    patient_id: '',
    doctor_id: '',
    appointment_date: '',
    appointment_time: '',
    reason_for_visit: 'Pediatric Consultation',
    bookedSlots: [],
    checkingSlots: false,
  });

  // Reschedule Form State
  const [rescheduleF, setRescheduleF] = useState({
    doctor_id: '',
    appointment_date: '',
    appointment_time: '',
    bookedSlots: [],
    checkingSlots: false,
  });

  // Notice auto-dismiss
  useEffect(() => {
    if (notice) {
      const timer = setTimeout(() => setNotice(''), 4500);
      return () => clearTimeout(timer);
    }
  }, [notice]);

  // Load doctors & patients list
  useEffect(() => {
    async function loadMeta() {
      try {
        const [docs, pats] = await Promise.all([
          listDoctors(token).catch(() => []),
          listMyPatients(token).catch(() => []),
        ]);
        if (Array.isArray(docs)) setDoctors(docs);
        if (Array.isArray(pats)) setPatients(pats);
      } catch (e) {
        console.warn('Could not load metadata:', e);
      }
    }
    loadMeta();
  }, [token]);

  // Main listAppointments query caller
  async function loadAppointmentsList() {
    setLoading(true);
    setError('');
    try {
      const queryParams = {};
      if (filterDoctor) queryParams.doctor_id = filterDoctor;
      if (filterPatient) queryParams.patient_id = filterPatient;
      if (filterStatus && filterStatus !== 'All') queryParams.status = filterStatus;

      if (dateMode === 'single' && filterDate) {
        queryParams.date = filterDate;
      } else if (dateMode === 'range' && filterStartDate && filterEndDate) {
        queryParams.start_date = filterStartDate;
        queryParams.end_date = filterEndDate;
      }

      const data = await listAppointments(token, queryParams);
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Could not load appointments.');
    } finally {
      setLoading(false);
    }
  }

  // Trigger load when filters change
  useEffect(() => {
    loadAppointmentsList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterDoctor, filterPatient, filterStatus, dateMode, filterDate, filterStartDate, filterEndDate, token]);

  // Availability Check for Booking Form
  useEffect(() => {
    if (!addF.doctor_id || !addF.appointment_date) {
      setAddF(prev => ({ ...prev, bookedSlots: [] }));
      return;
    }
    let active = true;
    async function checkAddSlots() {
      setAddF(prev => ({ ...prev, checkingSlots: true }));
      try {
        const res = await checkAvailability(addF.doctor_id, addF.appointment_date, token);
        if (active) {
          const booked = (res?.booked_times || []).map(t => String(t).slice(0, 5));
          setAddF(prev => ({
            ...prev,
            bookedSlots: booked,
            checkingSlots: false,
            appointment_time: booked.includes(prev.appointment_time) ? '' : prev.appointment_time,
          }));
        }
      } catch (err) {
        if (active) setAddF(prev => ({ ...prev, checkingSlots: false, bookedSlots: [] }));
      }
    }
    checkAddSlots();
    return () => { active = false; };
  }, [addF.doctor_id, addF.appointment_date, token]);

  // Availability Check for Reschedule Form
  useEffect(() => {
    if (!rescheduleF.doctor_id || !rescheduleF.appointment_date) {
      setRescheduleF(prev => ({ ...prev, bookedSlots: [] }));
      return;
    }
    let active = true;
    async function checkReschedSlots() {
      setRescheduleF(prev => ({ ...prev, checkingSlots: true }));
      try {
        const res = await checkAvailability(rescheduleF.doctor_id, rescheduleF.appointment_date, token);
        if (active) {
          const booked = (res?.booked_times || []).map(t => String(t).slice(0, 5));
          setRescheduleF(prev => ({
            ...prev,
            bookedSlots: booked,
            checkingSlots: false,
            appointment_time: booked.includes(prev.appointment_time) ? '' : prev.appointment_time,
          }));
        }
      } catch (err) {
        if (active) setRescheduleF(prev => ({ ...prev, checkingSlots: false, bookedSlots: [] }));
      }
    }
    checkReschedSlots();
    return () => { active = false; };
  }, [rescheduleF.doctor_id, rescheduleF.appointment_date, token]);

  // 1. CREATE APPOINTMENT
  async function handleCreate(e) {
    e.preventDefault();
    if (!addF.patient_id || !addF.doctor_id || !addF.appointment_date || !addF.appointment_time) {
      alert('Please fill out all required appointment fields.');
      return;
    }
    try {
      await createAppointment({
        patient_id: Number(addF.patient_id),
        doctor_id: Number(addF.doctor_id),
        appointment_date: addF.appointment_date,
        appointment_time: addF.appointment_time,
        reason_for_visit: addF.reason_for_visit,
      }, token);

      setNotice('Appointment booked successfully!');
      setShowAdd(false);
      setAddF({
        patient_id: '',
        doctor_id: '',
        appointment_date: '',
        appointment_time: '',
        reason_for_visit: 'Pediatric Consultation',
        bookedSlots: [],
        checkingSlots: false,
      });
      await loadAppointmentsList();
    } catch (err) {
      alert(err.message || 'Failed to book appointment.');
    }
  }

  // 2. GET APPOINTMENT (Details Modal)
  async function handleOpenView(appt) {
    setLoadingView(true);
    setViewA(appt);
    try {
      const full = await getAppointment(appt.id, token);
      if (full) setViewA(full);
    } catch (err) {
      console.warn('Could not fetch single appointment details:', err);
    } finally {
      setLoadingView(false);
    }
  }

  // 3. UPDATE APPOINTMENT STATUS
  async function handleStatusUpdate(apptId, newStatus) {
    try {
      const updated = await updateAppointmentStatus(apptId, newStatus, token);
      setRows(prev => prev.map(r => r.id === apptId ? { ...r, status: updated.status || newStatus } : r));
      if (viewA && viewA.id === apptId) {
        setViewA(prev => ({ ...prev, status: updated.status || newStatus }));
      }
      setNotice(`Appointment #${apptId} status updated to ${newStatus}`);
    } catch (err) {
      alert(err.message || 'Failed to update appointment status.');
    }
  }

  // 4. RESCHEDULE APPOINTMENT
  function handleOpenReschedule(appt) {
    const timeClean = appt.appointment_time ? String(appt.appointment_time).slice(0, 5) : '09:00';
    setRescheduleA(appt);
    setRescheduleF({
      doctor_id: String(appt.doctor_id || (doctors[0]?.id || 2)),
      appointment_date: appt.appointment_date || '',
      appointment_time: timeClean,
      bookedSlots: [],
      checkingSlots: false,
    });
  }

  async function handleRescheduleSubmit(e) {
    e.preventDefault();
    if (!rescheduleF.appointment_date || !rescheduleF.appointment_time) {
      alert('Please select both a date and an appointment time slot.');
      return;
    }
    try {
      await rescheduleAppointment(rescheduleA.id, {
        doctor_id: Number(rescheduleF.doctor_id),
        appointment_date: rescheduleF.appointment_date,
        appointment_time: rescheduleF.appointment_time,
      }, token);

      setNotice(`Appointment #${rescheduleA.id} rescheduled successfully!`);
      setRescheduleA(null);
      await loadAppointmentsList();
    } catch (err) {
      alert(err.message || 'Failed to reschedule appointment.');
    }
  }

  // 5. CANCEL APPOINTMENT
  async function handleConfirmCancel() {
    if (!cancelA) return;
    try {
      await updateAppointmentStatus(cancelA.id, 'Cancelled', token);
      setRows(prev => prev.map(r => r.id === cancelA.id ? { ...r, status: 'Cancelled' } : r));
      setNotice(`Appointment #${cancelA.id} has been cancelled.`);
      setCancelA(null);
    } catch (err) {
      alert(err.message || 'Failed to cancel appointment.');
    }
  }

  // Client search filter (by patient name or reason)
  const filteredRows = rows.filter(r => {
    const pName = (r.patient_name || '').toLowerCase();
    const docName = (r.doctor_name || '').toLowerCase();
    const reason = (r.reason_for_visit || '').toLowerCase();
    const q = search.toLowerCase();
    return pName.includes(q) || docName.includes(q) || reason.includes(q);
  });

  function clearAllFilters() {
    setFilterDoctor('');
    setFilterPatient('');
    setFilterStatus('All');
    setFilterDate('');
    setFilterStartDate('');
    setFilterEndDate('');
    setSearch('');
  }

  return (
    <>
      <div className="adm-panel">
        <div className="adm-panel-head">
          <div className="adm-panel-title">
            <Calendar size={22} color="#1e4d8c" />
            Appointments Management
            <span style={{ fontSize: 13, fontWeight: 500, color: '#64748b', marginLeft: 8 }}>
              ({filteredRows.length} visit{filteredRows.length === 1 ? '' : 's'})
            </span>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              className="adm-btn-view"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                background: '#f1f5f9',
                padding: '6px 12px',
                borderRadius: 8,
                fontSize: 12.5,
                fontWeight: 600,
                color: '#1e4d8c'
              }}
              onClick={loadAppointmentsList}
              title="Refresh live appointments"
            >
              <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
            </button>

            <button className="adm-add-btn" onClick={() => setShowAdd(true)}>
              <Plus size={15} /> Book Appointment
            </button>
          </div>
        </div>

        {/* Global Notice Banner */}
        {notice && (
          <div style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            padding: '10px 14px',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <CheckCircle2 size={16} /> {notice}
          </div>
        )}

        {/* Filter Controls Toolbar */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 10,
          padding: '14px 16px',
          marginBottom: 18,
          display: 'flex',
          flexDirection: 'column',
          gap: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: '#334155' }}>
            <Filter size={15} color="#1e4d8c" /> Filter Appointments
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
            {/* Filter: Doctor */}
            <div>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                Doctor:
              </label>
              <select
                className="adm-inp"
                style={{ padding: '7px 10px', fontSize: 12.5 }}
                value={filterDoctor}
                onChange={e => setFilterDoctor(e.target.value)}
              >
                <option value="">All Doctors</option>
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.doctor_name || `Dr. ID ${d.id}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter: Patient */}
            <div>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                Patient:
              </label>
              <select
                className="adm-inp"
                style={{ padding: '7px 10px', fontSize: 12.5 }}
                value={filterPatient}
                onChange={e => setFilterPatient(e.target.value)}
              >
                <option value="">All Patients</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.patient_name} (ID: {p.id})
                  </option>
                ))}
              </select>
            </div>

            {/* Filter: Status */}
            <div>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                Status:
              </label>
              <select
                className="adm-inp"
                style={{ padding: '7px 10px', fontSize: 12.5 }}
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {/* Filter: Date Mode Selection */}
            <div>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                Date Filter:
              </label>
              <div style={{ display: 'flex', gap: 4 }}>
                <button
                  type="button"
                  style={{
                    flex: 1,
                    padding: '7px 8px',
                    fontSize: 11.5,
                    fontWeight: 700,
                    borderRadius: 6,
                    border: '1px solid #cbd5e1',
                    background: dateMode === 'single' ? '#1e4d8c' : '#fff',
                    color: dateMode === 'single' ? '#fff' : '#475569',
                    cursor: 'pointer'
                  }}
                  onClick={() => { setDateMode('single'); setFilterStartDate(''); setFilterEndDate(''); }}
                >
                  Single Date
                </button>
                <button
                  type="button"
                  style={{
                    flex: 1,
                    padding: '7px 8px',
                    fontSize: 11.5,
                    fontWeight: 700,
                    borderRadius: 6,
                    border: '1px solid #cbd5e1',
                    background: dateMode === 'range' ? '#1e4d8c' : '#fff',
                    color: dateMode === 'range' ? '#fff' : '#475569',
                    cursor: 'pointer'
                  }}
                  onClick={() => { setDateMode('range'); setFilterDate(''); }}
                >
                  Date Range
                </button>
              </div>
            </div>

            {/* Filter: Date Input (Single vs Range) */}
            {dateMode === 'single' ? (
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                  Select Date:
                </label>
                <input
                  type="date"
                  className="adm-inp"
                  style={{ padding: '6px 10px', fontSize: 12.5 }}
                  value={filterDate}
                  onChange={e => setFilterDate(e.target.value)}
                />
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 6 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                    Start Date:
                  </label>
                  <input
                    type="date"
                    className="adm-inp"
                    style={{ padding: '6px 8px', fontSize: 11.5 }}
                    value={filterStartDate}
                    onChange={e => setFilterStartDate(e.target.value)}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                    End Date:
                  </label>
                  <input
                    type="date"
                    className="adm-inp"
                    style={{ padding: '6px 8px', fontSize: 11.5 }}
                    value={filterEndDate}
                    onChange={e => setFilterEndDate(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Search bar + Clear filters */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 4 }}>
            <div className="adm-search" style={{ maxWidth: '100%', flex: 1 }}>
              <Search size={15} color="#9ca3af" />
              <input
                placeholder="Search by patient name, doctor, or visit reason…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            {(filterDoctor || filterPatient || filterStatus !== 'All' || filterDate || filterStartDate || filterEndDate || search) && (
              <button
                type="button"
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  color: '#475569',
                  padding: '7px 12px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
                onClick={clearAllFilters}
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Appointments Table */}
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Patient</th>
                <th>Date</th>
                <th>Time</th>
                <th>Doctor</th>
                <th>Reason / Service</th>
                <th>Status</th>
                <th>Quick Status</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    <RefreshCw size={20} className="spin" style={{ margin: '0 auto 8px', display: 'block' }} />
                    Loading live appointments from database…
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '24px', color: '#b91c1c' }}>
                    <AlertTriangle size={20} style={{ margin: '0 auto 6px', display: 'block' }} />
                    {error}
                  </td>
                </tr>
              ) : filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                    No appointments found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredRows.map(a => (
                  <tr key={a.id}>
                    <td style={{ fontWeight: 700, color: '#1e4d8c' }}>#{a.id}</td>
                    <td>
                      <strong>{a.patient_name || 'Patient'}</strong>
                      {a.patient_id && (
                        <span style={{ fontSize: 11, color: '#64748b', display: 'block' }}>
                          ID: {a.patient_id}
                        </span>
                      )}
                    </td>
                    <td>{fmt(a.appointment_date)}</td>
                    <td style={{ fontWeight: 600 }}>{formatTimeDisplay(a.appointment_time)}</td>
                    <td style={{ color: '#0369a1' }}>{a.doctor_name || 'Assigned Doctor'}</td>
                    <td>{a.reason_for_visit || 'General Consultation'}</td>
                    <td>
                      <StatusBadge status={a.status || 'Confirmed'} />
                    </td>
                    <td>
                      <select
                        style={{
                          fontSize: 11.5,
                          padding: '4px 6px',
                          borderRadius: 6,
                          border: '1px solid #cbd5e1',
                          background: '#fff',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                        value={a.status || 'Confirmed'}
                        onChange={e => handleStatusUpdate(a.id, e.target.value)}
                        title="Update appointment status"
                      >
                        <option value="Confirmed">Confirmed</option>
                        <option value="Pending">Pending</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td>
                      <div className="adm-actions" style={{ justifyContent: 'center' }}>
                        <button
                          className="adm-btn-view"
                          onClick={() => handleOpenView(a)}
                          title="View Full Appointment Details"
                        >
                          <Eye size={17} />
                        </button>
                        <button
                          className="adm-btn-edit"
                          onClick={() => handleOpenReschedule(a)}
                          title="Reschedule Appointment"
                          style={{ color: '#0284c7' }}
                        >
                          <Clock size={16} />
                        </button>
                        <button
                          className="adm-btn-delete"
                          onClick={() => setCancelA(a)}
                          title="Cancel Appointment"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: VIEW DETAILS (getAppointment) */}
      {viewA && (
        <Overlay onClose={() => setViewA(null)}>
          <ModalHdr title={`Appointment Details #${viewA.id}`} onClose={() => setViewA(null)} />
          <div className="adm-modal-body">
            {loadingView && (
              <p style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>
                Refreshing latest details from server…
              </p>
            )}
            <Field label="Appointment ID:">
              <RO val={`APP-${String(viewA.id).padStart(3, '0')} (ID: ${viewA.id})`} />
            </Field>

            <Field label="Patient:">
              <RO val={`${viewA.patient_name || 'Patient'} (ID: ${viewA.patient_id})`} />
            </Field>

            <div className="adm-field-row">
              <Field label="Appointment Date:">
                <RO val={fmt(viewA.appointment_date)} />
              </Field>
              <Field label="Appointment Time:">
                <RO val={formatTimeDisplay(viewA.appointment_time)} />
              </Field>
            </div>

            <Field label="Attending Doctor:">
              <RO val={`${viewA.doctor_name || 'Doctor'} (Doctor ID: ${viewA.doctor_id})`} />
            </Field>

            <Field label="Reason for Visit / Service:">
              <RO val={viewA.reason_for_visit || 'General Consultation'} />
            </Field>

            <Field label="Current Status:">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <StatusBadge status={viewA.status || 'Confirmed'} />
                <span style={{ fontSize: 12, color: '#64748b' }}>Change to:</span>
                {['Pending', 'Confirmed', 'Completed', 'Cancelled'].map(st => (
                  <button
                    key={st}
                    type="button"
                    style={{
                      border: '1px solid #cbd5e1',
                      borderRadius: 6,
                      padding: '3px 8px',
                      fontSize: 11,
                      fontWeight: 700,
                      background: viewA.status === st ? '#1e4d8c' : '#f8fafc',
                      color: viewA.status === st ? '#fff' : '#334155',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleStatusUpdate(viewA.id, st)}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </Field>

            <div style={{ marginTop: 22, display: 'flex', gap: 10 }}>
              <button
                type="button"
                className="adm-submit"
                style={{ background: '#0284c7', flex: 1 }}
                onClick={() => {
                  const target = viewA;
                  setViewA(null);
                  handleOpenReschedule(target);
                }}
              >
                Reschedule Visit
              </button>
              <button
                type="button"
                className="adm-btn-cancel"
                style={{ flex: 1 }}
                onClick={() => setViewA(null)}
              >
                Close
              </button>
            </div>
          </div>
        </Overlay>
      )}

      {/* MODAL 2: CREATE APPOINTMENT (createAppointment + checkAvailability) */}
      {showAdd && (
        <Overlay onClose={() => setShowAdd(false)}>
          <ModalHdr title="Book New Appointment" onClose={() => setShowAdd(false)} />
          <div className="adm-modal-body">
            <form onSubmit={handleCreate}>
              {/* Select Patient */}
              <Field label="Select Patient: *">
                <select
                  className="adm-inp"
                  value={addF.patient_id}
                  onChange={e => setAddF({ ...addF, patient_id: e.target.value })}
                  required
                >
                  <option value="">-- Choose registered child/patient --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.patient_name} (ID: {p.id}, {p.gender})
                    </option>
                  ))}
                </select>
              </Field>

              {/* Select Doctor */}
              <Field label="Attending Doctor: *">
                <select
                  className="adm-inp"
                  value={addF.doctor_id}
                  onChange={e => setAddF({ ...addF, doctor_id: e.target.value })}
                  required
                >
                  <option value="">-- Choose pediatrician --</option>
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.doctor_name || `Dr. ID ${d.id}`}
                    </option>
                  ))}
                </select>
              </Field>

              {/* Date & Time Slot */}
              <div className="adm-field-row">
                <Field label="Visit Date: *">
                  <input
                    type="date"
                    className="adm-inp"
                    min={new Date().toISOString().split('T')[0]}
                    value={addF.appointment_date}
                    onChange={e => setAddF({ ...addF, appointment_date: e.target.value })}
                    required
                  />
                </Field>

                <Field label="Time Slot: *">
                  <select
                    className="adm-inp"
                    value={addF.appointment_time}
                    onChange={e => setAddF({ ...addF, appointment_time: e.target.value })}
                    required
                    disabled={!addF.doctor_id || !addF.appointment_date || addF.checkingSlots}
                  >
                    <option value="">
                      {!addF.doctor_id || !addF.appointment_date
                        ? 'Select doctor & date first'
                        : addF.checkingSlots
                        ? 'Checking availability…'
                        : '-- Select a free slot --'}
                    </option>
                    {STANDARD_TIME_SLOTS.map(slot => {
                      const isBooked = addF.bookedSlots.includes(slot);
                      return (
                        <option key={slot} value={slot} disabled={isBooked}>
                          {formatTimeDisplay(slot)} {isBooked ? '(Booked - Busy)' : '(Available)'}
                        </option>
                      );
                    })}
                  </select>
                </Field>
              </div>

              {/* Visual Slot Availability Badges */}
              {addF.doctor_id && addF.appointment_date && (
                <div style={{ marginBottom: 14 }}>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6 }}>
                    Live Slot Availability for {addF.appointment_date}:
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {STANDARD_TIME_SLOTS.map(slot => {
                      const isBooked = addF.bookedSlots.includes(slot);
                      const isSelected = addF.appointment_time === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          disabled={isBooked}
                          onClick={() => setAddF({ ...addF, appointment_time: slot })}
                          style={{
                            padding: '4px 7px',
                            borderRadius: 6,
                            fontSize: 11,
                            fontWeight: 700,
                            border: isSelected ? '2px solid #1e4d8c' : '1px solid #cbd5e1',
                            background: isBooked ? '#f1f5f9' : isSelected ? '#dbeafe' : '#fff',
                            color: isBooked ? '#94a3b8' : isSelected ? '#1e4d8c' : '#334155',
                            cursor: isBooked ? 'not-allowed' : 'pointer',
                            textDecoration: isBooked ? 'line-through' : 'none'
                          }}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Reason for visit */}
              <Field label="Reason for Visit / Service: *">
                <input
                  className="adm-inp"
                  value={addF.reason_for_visit}
                  placeholder="e.g. Routine vaccination, Fever checkup, Growth monitoring"
                  onChange={e => setAddF({ ...addF, reason_for_visit: e.target.value })}
                  required
                />
              </Field>

              <SubmitBtn label="Confirm & Book Slot" />
            </form>
          </div>
        </Overlay>
      )}

      {/* MODAL 3: RESCHEDULE APPOINTMENT (rescheduleAppointment + checkAvailability) */}
      {rescheduleA && (
        <Overlay onClose={() => setRescheduleA(null)}>
          <ModalHdr title={`Reschedule Appointment #${rescheduleA.id}`} onClose={() => setRescheduleA(null)} />
          <div className="adm-modal-body">
            <p style={{ fontSize: 12.5, color: '#64748b', marginBottom: 14 }}>
              Rescheduling for patient <strong>{rescheduleA.patient_name}</strong>. Current schedule: {fmt(rescheduleA.appointment_date)} at {formatTimeDisplay(rescheduleA.appointment_time)}.
            </p>

            <form onSubmit={handleRescheduleSubmit}>
              <Field label="Assigned Doctor:">
                <select
                  className="adm-inp"
                  value={rescheduleF.doctor_id}
                  onChange={e => setRescheduleF({ ...rescheduleF, doctor_id: e.target.value })}
                  required
                >
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.doctor_name || `Dr. ID ${d.id}`}
                    </option>
                  ))}
                </select>
              </Field>

              <div className="adm-field-row">
                <Field label="New Appointment Date: *">
                  <input
                    type="date"
                    className="adm-inp"
                    min={new Date().toISOString().split('T')[0]}
                    value={rescheduleF.appointment_date}
                    onChange={e => setRescheduleF({ ...rescheduleF, appointment_date: e.target.value })}
                    required
                  />
                </Field>

                <Field label="New Time Slot: *">
                  <select
                    className="adm-inp"
                    value={rescheduleF.appointment_time}
                    onChange={e => setRescheduleF({ ...rescheduleF, appointment_time: e.target.value })}
                    required
                    disabled={rescheduleF.checkingSlots}
                  >
                    <option value="">
                      {rescheduleF.checkingSlots ? 'Checking slot availability…' : '-- Choose free time slot --'}
                    </option>
                    {STANDARD_TIME_SLOTS.map(slot => {
                      const isBooked = rescheduleF.bookedSlots.includes(slot);
                      return (
                        <option key={slot} value={slot} disabled={isBooked}>
                          {formatTimeDisplay(slot)} {isBooked ? '(Booked - Conflict)' : '(Free slot)'}
                        </option>
                      );
                    })}
                  </select>
                </Field>
              </div>

              {/* Slot badges for reschedule */}
              {rescheduleF.appointment_date && (
                <div style={{ marginBottom: 14 }}>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6 }}>
                    Available time slots on {rescheduleF.appointment_date}:
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {STANDARD_TIME_SLOTS.map(slot => {
                      const isBooked = rescheduleF.bookedSlots.includes(slot);
                      const isSelected = rescheduleF.appointment_time === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          disabled={isBooked}
                          onClick={() => setRescheduleF({ ...rescheduleF, appointment_time: slot })}
                          style={{
                            padding: '4px 7px',
                            borderRadius: 6,
                            fontSize: 11,
                            fontWeight: 700,
                            border: isSelected ? '2px solid #0284c7' : '1px solid #cbd5e1',
                            background: isBooked ? '#f1f5f9' : isSelected ? '#e0f2fe' : '#fff',
                            color: isBooked ? '#94a3b8' : isSelected ? '#0284c7' : '#334155',
                            cursor: isBooked ? 'not-allowed' : 'pointer',
                            textDecoration: isBooked ? 'line-through' : 'none'
                          }}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
                <button type="submit" className="adm-submit" style={{ flex: 1, background: '#0284c7' }}>
                  Save & Reschedule
                </button>
                <button
                  type="button"
                  className="adm-btn-cancel"
                  style={{ flex: 1 }}
                  onClick={() => setRescheduleA(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </Overlay>
      )}

      {/* MODAL 4: CANCEL APPOINTMENT CONFIRMATION */}
      {cancelA && (
        <Overlay onClose={() => setCancelA(null)}>
          <ModalHdr title="Cancel Appointment" onClose={() => setCancelA(null)} />
          <div className="adm-del-body">
            <div className="adm-del-icon"><AlertCircle size={38} color="#7b1717" /></div>
            <div className="adm-del-title">Cancel Appointment #{cancelA.id}?</div>
            <div className="adm-del-sub">
              Are you sure you want to cancel the appointment for <strong>{cancelA.patient_name}</strong> on {fmt(cancelA.appointment_date)} at {formatTimeDisplay(cancelA.appointment_time)}?
            </div>
            <div className="adm-del-btns">
              <button className="adm-btn-cancel" onClick={() => setCancelA(null)}>Keep Visit</button>
              <button className="adm-btn-confirm" onClick={handleConfirmCancel}>Confirm Cancellation</button>
            </div>
          </div>
        </Overlay>
      )}
    </>
  );
}

function SectionVaccinations() {
  const [rows, setRows]     = useState(INIT_VACC)
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [deleteV, setDeleteV] = useState(null)
  const [addF, setAddF] = useState({ patient:'', vaccine:'', date:'', status:'Pending' })

  const filtered = rows.filter(r=>r.patient.toLowerCase().includes(search.toLowerCase())||r.vaccine.toLowerCase().includes(search.toLowerCase()))
  function doAdd(e) { e.preventDefault(); setRows([...rows,{id:`V-${String(rows.length+1).padStart(3,'0')}`, ...addF}]); setAddF({patient:'',vaccine:'',date:'',status:'Pending'}); setShowAdd(false) }
  function doDelete() { setRows(rows.filter(r=>r.id!==deleteV.id)); setDeleteV(null) }
  function markDone(id) { setRows(rows.map(r=>r.id===id?{...r,status:'Completed'}:r)) }

  return (
    <>
      <div className="adm-panel">
        <PanelHead icon={Syringe} title="Vaccinations" search={search} setSearch={setSearch} onAdd={()=>setShowAdd(true)}/>
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead><tr><th>ID</th><th>Patient</th><th>Vaccine</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(v=>(
                <tr key={v.id}>
                  <td>{v.id}</td><td>{v.patient}</td><td>{v.vaccine}</td><td>{fmt(v.date)}</td>
                  <td><StatusBadge status={v.status}/></td>
                  <td><div className="adm-actions">
                    {v.status==='Pending' && <button className="adm-btn-view" title="Mark completed" onClick={()=>markDone(v.id)}><Check size={17}/></button>}
                    <button className="adm-btn-delete" onClick={()=>setDeleteV(v)}><Trash2 size={16}/></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {showAdd && <Overlay onClose={()=>setShowAdd(false)}><ModalHdr title="Add Vaccination" onClose={()=>setShowAdd(false)}/>
        <div className="adm-modal-body"><form onSubmit={doAdd}>
          <Field label="Patient Name:"><Inp value={addF.patient} placeholder="Patient" onChange={e=>setAddF({...addF,patient:e.target.value})}/></Field>
          <Field label="Vaccine:"><Inp value={addF.vaccine} placeholder="Vaccine name" onChange={e=>setAddF({...addF,vaccine:e.target.value})}/></Field>
          <Field label="Date:"><Inp type="date" value={addF.date} onChange={e=>setAddF({...addF,date:e.target.value})}/></Field>
          <Field label="Status:">
            <select className="adm-inp" value={addF.status} onChange={e=>setAddF({...addF,status:e.target.value})}>
              <option>Pending</option><option>Completed</option>
            </select>
          </Field>
          <SubmitBtn label="Add Vaccination"/>
        </form></div>
      </Overlay>}
      {deleteV && <Overlay onClose={()=>setDeleteV(null)}><ModalHdr title="Delete Vaccination" onClose={()=>setDeleteV(null)}/>
        <DeleteConfirm onCancel={()=>setDeleteV(null)} onDelete={doDelete}/>
      </Overlay>}
    </>
  )
}

function SectionPayments() {
  const [rows, setRows]     = useState(INIT_PAYMENTS)
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [deleteP, setDeleteP] = useState(null)
  const [addF, setAddF] = useState({ patient:'', amount:'', date:'', service:'Consultation', status:'Pending' })

  const filtered = rows.filter(r=>r.patient.toLowerCase().includes(search.toLowerCase()))
  function doAdd(e) { e.preventDefault(); setRows([...rows,{id:`PAY-${String(rows.length+1).padStart(3,'0')}`, ...addF}]); setAddF({patient:'',amount:'',date:'',service:'Consultation',status:'Pending'}); setShowAdd(false) }
  function doDelete() { setRows(rows.filter(r=>r.id!==deleteP.id)); setDeleteP(null) }
  function markPaid(id) { setRows(rows.map(r=>r.id===id?{...r,status:'Paid'}:r)) }

  return (
    <>
      <div className="adm-panel">
        <PanelHead icon={CreditCard} title="Payments" search={search} setSearch={setSearch} onAdd={()=>setShowAdd(true)}/>
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead><tr><th>ID</th><th>Patient</th><th>Amount</th><th>Date</th><th>Service</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(p=>(
                <tr key={p.id}>
                  <td>{p.id}</td><td>{p.patient}</td><td>{p.amount}</td><td>{fmt(p.date)}</td>
                  <td>{p.service}</td><td><StatusBadge status={p.status}/></td>
                  <td><div className="adm-actions">
                    {p.status==='Pending' && <button className="adm-btn-view" title="Mark paid" onClick={()=>markPaid(p.id)}><Check size={17}/></button>}
                    <button className="adm-btn-delete" onClick={()=>setDeleteP(p)}><Trash2 size={16}/></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {showAdd && <Overlay onClose={()=>setShowAdd(false)}><ModalHdr title="Add Payment" onClose={()=>setShowAdd(false)}/>
        <div className="adm-modal-body"><form onSubmit={doAdd}>
          <Field label="Patient Name:"><Inp value={addF.patient} placeholder="Patient" onChange={e=>setAddF({...addF,patient:e.target.value})}/></Field>
          <Field label="Amount:"><Inp value={addF.amount} placeholder="₱0.00" onChange={e=>setAddF({...addF,amount:e.target.value})}/></Field>
          <Field label="Date:"><Inp type="date" value={addF.date} onChange={e=>setAddF({...addF,date:e.target.value})}/></Field>
          <Field label="Service:">
            <select className="adm-inp" value={addF.service} onChange={e=>setAddF({...addF,service:e.target.value})}>
              {['Consultation','Vaccination','Lab Test','Procedure'].map(s=><option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Status:">
            <select className="adm-inp" value={addF.status} onChange={e=>setAddF({...addF,status:e.target.value})}>
              <option>Pending</option><option>Paid</option>
            </select>
          </Field>
          <SubmitBtn label="Add Payment"/>
        </form></div>
      </Overlay>}
      {deleteP && <Overlay onClose={()=>setDeleteP(null)}><ModalHdr title="Delete Payment" onClose={()=>setDeleteP(null)}/>
        <DeleteConfirm onCancel={()=>setDeleteP(null)} onDelete={doDelete}/>
      </Overlay>}
    </>
  )
}

function SectionPrescriptions() {
  const [rows, setRows]     = useState(INIT_PRESCRIPTIONS)
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [viewRx,  setViewRx]  = useState(null)
  const [deleteRx, setDeleteRx]= useState(null)
  const [addF, setAddF] = useState({ patient:'', medication:'', dosage:'', doctor:'', date:'' })

  const filtered = rows.filter(r=>r.patient.toLowerCase().includes(search.toLowerCase())||r.medication.toLowerCase().includes(search.toLowerCase()))
  function doAdd(e) { e.preventDefault(); setRows([...rows,{id:`RX-${String(rows.length+1).padStart(3,'0')}`, ...addF}]); setAddF({patient:'',medication:'',dosage:'',doctor:'',date:''}); setShowAdd(false) }
  function doDelete() { setRows(rows.filter(r=>r.id!==deleteRx.id)); setDeleteRx(null) }

  return (
    <>
      <div className="adm-panel">
        <PanelHead icon={FileText} title="Prescriptions" search={search} setSearch={setSearch} onAdd={()=>setShowAdd(true)}/>
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead><tr><th>ID</th><th>Patient</th><th>Medication</th><th>Dosage</th><th>Doctor</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(r=>(
                <tr key={r.id}>
                  <td>{r.id}</td><td>{r.patient}</td><td>{r.medication}</td><td>{r.dosage}</td>
                  <td>{r.doctor}</td><td>{fmt(r.date)}</td>
                  <td><div className="adm-actions">
                    <button className="adm-btn-view" onClick={()=>setViewRx(r)}><Eye size={17}/></button>
                    <button className="adm-btn-delete" onClick={()=>setDeleteRx(r)}><Trash2 size={16}/></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {showAdd && <Overlay onClose={()=>setShowAdd(false)}><ModalHdr title="New Prescription" onClose={()=>setShowAdd(false)}/>
        <div className="adm-modal-body"><form onSubmit={doAdd}>
          <Field label="Patient Name:"><Inp value={addF.patient} placeholder="Patient" onChange={e=>setAddF({...addF,patient:e.target.value})}/></Field>
          <Field label="Medication:"><Inp value={addF.medication} placeholder="Drug name & dosage" onChange={e=>setAddF({...addF,medication:e.target.value})}/></Field>
          <Field label="Instructions:"><Inp value={addF.dosage} placeholder="e.g. 3x daily for 7 days" onChange={e=>setAddF({...addF,dosage:e.target.value})}/></Field>
          <Field label="Doctor:"><Inp value={addF.doctor} placeholder="Prescribing doctor" onChange={e=>setAddF({...addF,doctor:e.target.value})}/></Field>
          <Field label="Date:"><Inp type="date" value={addF.date} onChange={e=>setAddF({...addF,date:e.target.value})}/></Field>
          <SubmitBtn label="Add Prescription"/>
        </form></div>
      </Overlay>}
      {viewRx && <Overlay onClose={()=>setViewRx(null)}><ModalHdr title="Prescription Details" onClose={()=>setViewRx(null)}/>
        <div className="adm-modal-body">
          <Field label="ID:"><RO val={viewRx.id}/></Field>
          <Field label="Patient:"><RO val={viewRx.patient}/></Field>
          <Field label="Medication:"><RO val={viewRx.medication}/></Field>
          <Field label="Instructions:"><RO val={viewRx.dosage}/></Field>
          <Field label="Doctor:"><RO val={viewRx.doctor}/></Field>
          <Field label="Date:"><RO val={fmt(viewRx.date)}/></Field>
        </div>
      </Overlay>}
      {deleteRx && <Overlay onClose={()=>setDeleteRx(null)}><ModalHdr title="Delete Prescription" onClose={()=>setDeleteRx(null)}/>
        <DeleteConfirm onCancel={()=>setDeleteRx(null)} onDelete={doDelete}/>
      </Overlay>}
    </>
  )
}

function SectionReports() {
  const totalPatients = INIT_PATIENTS.length
  const totalAppts    = INIT_APPTS.length
  const confirmedAppts= INIT_APPTS.filter(a=>a.status==='Confirmed').length
  const paidPayments  = INIT_PAYMENTS.filter(p=>p.status==='Paid').length
  const pendingPayments=INIT_PAYMENTS.filter(p=>p.status==='Pending').length
  const completedVacc = INIT_VACC.filter(v=>v.status==='Completed').length
  const totalPaid     = INIT_PAYMENTS.filter(p=>p.status==='Paid').reduce((s,p)=>s+parseInt(p.amount.replace('₱','').replace(',','')),0)

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
      <div className="kcc-cards" style={{ marginBottom: 0 }}>
        <StatCard num={totalPatients} label="Total Patients" icon="child" />
        <StatCard num={totalAppts} label="Appointments" icon="calendar" />
        <StatCard num={confirmedAppts} label="Confirmed Appts" icon="calendar" />
        <StatCard num={paidPayments} label="Paid Payments" icon="payment" />
        <StatCard num={pendingPayments} label="Pending Payments" icon="payment" />
        <StatCard num={completedVacc} label="Vaccinations Done" icon="vaccine" />
      </div>
      <div className="adm-panel">
        <div className="adm-panel-title" style={{ marginBottom:18, fontSize:17, fontWeight:700, color:'#1c5d99', display:'flex', alignItems:'center', gap:8 }}>
          <BarChart2 size={20}/> Revenue Summary
        </div>
        <table className="adm-table">
          <thead><tr><th>Month</th><th>Consultations</th><th>Vaccinations</th><th>Lab Tests</th><th>Total</th></tr></thead>
          <tbody>
            {[
              { month:'July 2025',    c:'₱1,000', v:'₱800',   l:'₱0',     t:'₱1,800' },
              { month:'August 2025',  c:'₱500',   v:'₱0',     l:'₱0',     t:'₱500'   },
              { month:'September 2025',c:'₱1,600', v:'₱0',    l:'₱1,200', t:'₱2,800' },
            ].map(r=>(
              <tr key={r.month}>
                <td>{r.month}</td><td>{r.c}</td><td>{r.v}</td><td>{r.l}</td>
                <td style={{ fontWeight:700 }}>{r.t}</td>
              </tr>
            ))}
            <tr>
              <td colSpan={4} style={{ fontWeight:700, textAlign:'right' }}>Grand Total</td>
              <td style={{ fontWeight:800, color:'#1e4d8c' }}>₱{totalPaid.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const location = useLocation()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'Dashboard')

  useEffect(() => {
    if (location.state?.activeTab) setActiveTab(location.state.activeTab)
  }, [location.key])

  function handleNavigate(tab) {
    setActiveTab(tab)
    navigate('/admin-dashboard', { state: { activeTab: tab } })
  }

  return (
    <div className="dash-layout">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;800&display=swap');
        .kcc-cards{display:grid;grid-template-columns:repeat(3,1fr);gap:26px;margin-bottom:34px}
        .kcc-card{position:relative;height:130px;border-radius:6px;overflow:hidden;cursor:pointer;display:flex;align-items:center;padding-left:23px;color:#fff;font-family:'Montserrat',sans-serif;background:linear-gradient(90deg,#76aff1 0%,#4f88d6 16%,#4177c3 50%,#2d5ca2 100%);box-shadow:0 4px 8px rgba(0,0,0,.16);transition:transform .15s ease,box-shadow .15s ease}
        .kcc-card:hover{transform:translateY(-2px);box-shadow:0 8px 16px rgba(0,0,0,.22)}
        .kcc-text{position:relative;z-index:2}
        .kcc-num{font-size:40px;font-weight:800;line-height:44px}
        .kcc-label{width:min-content;font-size:20px;font-weight:500;line-height:24px}
        .kcc-icon{position:absolute;right:0;bottom:0;z-index:1}
        .adm-panel{background:#fff;border-radius:14px;padding:26px;box-shadow:0 2px 12px rgba(0,0,0,.07)}
        .adm-panel-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;flex-wrap:wrap;gap:10px}
        .adm-panel-title{display:flex;align-items:center;gap:8px;font-size:17px;font-weight:700;color:#1c5d99}
        .adm-search{display:flex;align-items:center;gap:8px;border:1.5px solid #d1d5db;border-radius:8px;padding:6px 12px;flex:1;max-width:300px}
        .adm-search input{border:none;outline:none;font-size:13px;width:100%}
        .adm-add-btn{display:flex;align-items:center;gap:6px;font-size:13px;font-weight:700;background:linear-gradient(180deg,#f2788d,#c0414f);color:#fff;border:none;border-radius:8px;padding:8px 16px;cursor:pointer}
        .adm-add-btn:hover{filter:brightness(.93)}
        .adm-table-wrap{overflow-x:auto}
        .adm-table{width:100%;border-collapse:collapse}
        .adm-table th{background:#1e4d8c;color:#fff;padding:12px 14px;font-size:12.5px;font-weight:700;text-align:left}
        .adm-table th:first-child{border-radius:8px 0 0 8px}
        .adm-table th:last-child{border-radius:0 8px 8px 0}
        .adm-table td{padding:13px 14px;font-size:13px;border-bottom:1px solid #f1f5f9}
        .adm-table tr:last-child td{border-bottom:none}
        .adm-table tr:hover td{background:#f8fafc}
        .adm-actions{display:flex;gap:10px;align-items:center}
        .adm-btn-view,.adm-btn-edit{background:none;border:none;cursor:pointer;color:#1c5d99;padding:2px}
        .adm-btn-delete{background:none;border:none;cursor:pointer;color:#dc2626;padding:2px}
        .adm-btn-view:hover,.adm-btn-edit:hover{color:#0e4080}
        .adm-btn-delete:hover{color:#b91c1c}
        .adm-overlay{position:fixed;inset:0;background:rgba(10,20,40,.5);display:flex;align-items:center;justify-content:center;z-index:1000;padding:20px}
        .adm-modal{background:#fff;border-radius:14px;width:100%;max-width:470px;max-height:90vh;overflow-y:auto;box-shadow:0 20px 50px rgba(0,0,0,.3);animation:admPop .16s ease-out}
        @keyframes admPop{from{transform:scale(.94);opacity:0}to{transform:scale(1);opacity:1}}
        .adm-modal-hdr{background:#1e4d8c;color:#fff;padding:16px 22px;display:flex;align-items:center;justify-content:space-between;font-size:16px;font-weight:700;position:sticky;top:0;z-index:1}
        .adm-modal-close{background:none;border:none;color:#fff;cursor:pointer;display:flex;align-items:center}
        .adm-modal-body{padding:24px 24px 20px}
        .adm-field{margin-bottom:14px}
        .adm-field label{display:block;font-size:13px;font-weight:700;color:#1c5d99;margin-bottom:5px}
        .adm-field-row{display:flex;gap:12px}
        .adm-field-row .adm-field{flex:1}
        .adm-inp{width:100%;border:1.5px solid #d1d5db;border-radius:8px;padding:10px 12px;font-size:13px;color:#374151;outline:none;box-sizing:border-box;background:#f8f9fb}
        .adm-inp:focus{border-color:#1c5d99;background:#fff}
        .adm-ro{background:#f0f2f6;border:1.5px solid #e2e8f0;border-radius:8px;padding:10px 12px;font-size:13px;color:#374151}
        .adm-gender-row{display:flex;gap:12px}
        .adm-gender-opt{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;border:1.5px solid #d1d5db;border-radius:10px;padding:10px 8px;cursor:pointer;font-size:12.5px;font-weight:600;color:#6b7280;background:#f8f9fb;transition:.15s;user-select:none}
        .adm-gender-opt.sel{border-color:#1c5d99;background:#eff6ff;color:#1c5d99}
        .adm-submit{width:100%;padding:12px;border:none;border-radius:10px;background:#1e4d8c;color:#fff;font-size:15px;font-weight:700;cursor:pointer;margin-top:6px}
        .adm-submit:hover{filter:brightness(.92)}
        .adm-del-body{text-align:center;padding:28px 24px 22px}
        .adm-del-icon{width:72px;height:72px;border-radius:50%;border:3px solid #7b1717;display:flex;align-items:center;justify-content:center;margin:0 auto 16px}
        .adm-del-title{font-size:18px;font-weight:800;color:#7b1717;margin-bottom:8px}
        .adm-del-sub{font-size:13px;color:#6b7280;margin-bottom:22px}
        .adm-del-btns{display:flex;gap:12px;justify-content:center}
        .adm-btn-cancel{flex:1;max-width:160px;padding:12px;border:none;border-radius:10px;background:#1e4d8c;color:#fff;font-size:14px;font-weight:700;cursor:pointer}
        .adm-btn-confirm{flex:1;max-width:160px;padding:12px;border:none;border-radius:10px;background:#c0392b;color:#fff;font-size:14px;font-weight:700;cursor:pointer}
        .adm-btn-cancel:hover{filter:brightness(.9)}
        .adm-btn-confirm:hover{filter:brightness(.9)}
        @media(max-width:900px){.kcc-cards{grid-template-columns:1fr}}
      `}</style>

      <AdminSidebar active={activeTab} />

      <main className="dash-main">
        <div className="dash-topbar">
          <h1 className="dash-title">{activeTab.toUpperCase()}</h1>
        </div>

        {activeTab === 'Dashboard'         && <SectionDashboard patients={INIT_PATIENTS} onNavigate={handleNavigate}/>}
        {activeTab === 'User Management'   && <SectionUserMgmt/>}
        {activeTab === 'Patient Management'&& <SectionPatientMgmt/>}
        {activeTab === 'Medical Records'   && <SectionMedicalRecords/>}
        {activeTab === 'Appointments'      && <SectionAppointments/>}
        {activeTab === 'Vaccinations'      && <SectionVaccinations/>}
        {activeTab === 'Payments'          && <SectionPayments/>}
        {activeTab === 'Prescriptions'     && <SectionPrescriptions/>}
        {activeTab === 'Reports'           && <SectionReports/>}
      </main>
    </div>
  )
}