import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Users, Calendar, CreditCard, Search, Plus, Eye, Pencil, Trash2, X, AlertCircle,
  ClipboardList, Syringe, FileText, BarChart2, Check,
  ArrowLeft, HeartPulse, Thermometer, Wind
} from 'lucide-react'
import AdminSidebar from '../components/AdminSidebar.jsx'

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

function initials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('')
}

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
          {g}
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
  const [rows, setRows]             = useState(patients)

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
        <StatCard num={5} label="Appointments" icon="calendar" onClick={()=>onNavigate('Appointments')} />
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
          <div className="adm-hero">
            <div className="adm-avatar">{initials(viewP.name)}</div>
            <div>
              <div className="adm-hero-name">{viewP.name}</div>
              <div className="adm-hero-id">{viewP.id}</div>
            </div>
          </div>
          <div className="adm-grid">
            <Field label="Age:"><RO val={viewP.age}/></Field>
            <Field label="Gender"><RO val={viewP.gender}/></Field>
            <Field label="Next Visit:"><RO val={fmt(viewP.nextVisit)}/></Field>
            <Field label="Patient's Guardian:"><RO val={viewP.guardian}/></Field>
          </div>
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
          <div className="adm-hero">
            <div className="adm-avatar">{initials(viewP.name)}</div>
            <div>
              <div className="adm-hero-name">{viewP.name}</div>
              <div className="adm-hero-id">{viewP.id}</div>
            </div>
          </div>
          <div className="adm-grid">
            <Field label="Age:"><RO val={viewP.age}/></Field>
            <Field label="Gender"><RO val={viewP.gender}/></Field>
            <Field label="Next Visit:"><RO val={fmt(viewP.nextVisit)}/></Field>
            <Field label="Guardian:"><RO val={viewP.guardian}/></Field>
          </div>
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

// Clinical details the app does not store yet. Sample values only; replace with backend data.
const SAMPLE_MED = {
  'KC-001': {
    vitals: { hr: 92, temp: '37.2', rr: 20 },
    allergies: 'None', chronic: 'None',
    past: ['Common Cold (2024)', 'Mild Fever (2025)'],
    blood: 'O+ (Positive)', height: '110 cm', weight: '14.5 kg',
    notes: 'Patient is stable. Symptoms consistent with viral upper respiratory infection. Advised rest, fluids, and medication compliance. Follow-up if symptoms persist beyond 5 days.',
  },
  'KC-002': {
    vitals: { hr: 98, temp: '36.8', rr: 22 },
    allergies: 'None', chronic: 'None',
    past: ['Acute Otitis Media (2024)'],
    blood: 'A+ (Positive)', height: '96 cm', weight: '14.0 kg',
    notes: 'Routine vaccination visit. No adverse reactions observed. Next dose as scheduled.',
  },
  'KC-003': {
    vitals: { hr: 104, temp: '36.9', rr: 24 },
    allergies: 'None', chronic: 'None',
    past: ['Acute Gastroenteritis (2025)'],
    blood: 'B+ (Positive)', height: '76 cm', weight: '9.5 kg',
    notes: 'Routine checkup. Growth and development within normal range. Varicella vaccine still pending.',
  },
  'KC-004': {
    vitals: { hr: 88, temp: '37.0', rr: 20 },
    allergies: 'None', chronic: 'None',
    past: ['Acute Bronchitis (2025)'],
    blood: 'O- (Negative)', height: '110 cm', weight: '18.0 kg',
    notes: 'Bronchitis follow-up. Continue inhaler as prescribed; return if wheezing or fever persists.',
  },
  'KC-005': {
    vitals: { hr: 96, temp: '36.7', rr: 21 },
    allergies: 'None', chronic: 'None',
    past: [],
    blood: 'A- (Negative)', height: '96 cm', weight: '14.2 kg',
    notes: 'No clinical notes recorded yet.',
  },
  'KC-006': {
    vitals: { hr: 100, temp: '36.6', rr: 22 },
    allergies: 'None', chronic: 'None',
    past: [],
    blood: 'AB+ (Positive)', height: '86 cm', weight: '12.1 kg',
    notes: 'No clinical notes recorded yet.',
  },
}
const SAMPLE_EMPTY = {
  vitals: { hr: '—', temp: '—', rr: '—' },
  allergies: '—', chronic: '—', past: [],
  blood: '—', height: '—', weight: '—',
  notes: 'No clinical notes recorded yet.',
}

function VitalCard({ icon: Icon, label, value, unit }) {
  return (
    <div className="mh-vital">
      <Icon size={30} className="mh-vital-icon" />
      <div className="mh-vital-label">{label}</div>
      <div className="mh-vital-value">{value}<small>{unit}</small></div>
    </div>
  )
}

function InfoRow({ label, value }) {
  return <div className="mh-info-row"><span>{label}</span><span>{value}</span></div>
}

function MedicalHistory({ name, records, onBack }) {
  const base = INIT_PATIENTS.find(p => p.name === name) ||
    { id: '—', name, age: '—', gender: '—', nextVisit: '', guardian: '—' }
  const med  = SAMPLE_MED[base.id] || SAMPLE_EMPTY
  const rx   = INIT_PRESCRIPTIONS.filter(r => r.patient === base.name)
  const vx   = INIT_VACC.filter(v => v.patient === base.name)
  const last = records
    .filter(r => r.patient === base.name)
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))[0]

  return (
    <>
      <button className="mh-back" onClick={onBack}>
        <ArrowLeft size={16} /> Back to Medical Records
      </button>

      <div className="mh-layout">
        <div className="mh-col">
          <div className="mh-card mh-profile">
            <div className="mh-avatar">{initials(base.name)}</div>
            <div className="mh-name">{base.name}</div>
            <div className="mh-age">Age: {base.age}</div>
          </div>

          <div className="mh-card">
            <div className="mh-card-title">Information</div>
            <InfoRow label="Patient ID" value={base.id} />
            <InfoRow label="Name" value={base.name} />
            <InfoRow label="Age" value={base.age} />
            <InfoRow label="Gender" value={base.gender} />
            <InfoRow label="Guardian" value={base.guardian} />
            <InfoRow label="Blood Type" value={med.blood} />
            <InfoRow label="Height" value={med.height} />
            <InfoRow label="Weight" value={med.weight} />
          </div>
        </div>

        <div className="mh-col">
          <div className="mh-vitals">
            <VitalCard icon={HeartPulse} label="Heart Rate" value={med.vitals.hr} unit="bpm" />
            <VitalCard icon={Thermometer} label="Temperature" value={med.vitals.temp} unit="°C" />
            <VitalCard icon={Wind} label="Respiratory Rate" value={med.vitals.rr} unit="breaths/min" />
          </div>

          <div className="mh-card">
            <div className="mh-card-title">Medical Information</div>
            <div className="mh-med-grid">
              <div>
                <div className="mh-med-label">Allergy</div>
                <div className="mh-med-value">{med.allergies}</div>
              </div>
              <div>
                <div className="mh-med-label">Chronic Illness</div>
                <div className="mh-med-value">{med.chronic}</div>
              </div>
              <div>
                <div className="mh-med-label">Past Illnesses</div>
                {med.past.length
                  ? <ul className="mh-list">{med.past.map(p => <li key={p}>{p}</li>)}</ul>
                  : <div className="mh-med-value">None</div>}
              </div>
            </div>
          </div>

          <div className="mh-card">
            <div className="mh-card-title">Prescriptions</div>
            {rx.length ? (
              <div className="adm-table-wrap">
                <table className="adm-table">
                  <thead><tr><th>Medication</th><th>Instructions</th><th>Date</th></tr></thead>
                  <tbody>
                    {rx.map(r => (
                      <tr key={r.id}><td>{r.medication}</td><td>{r.dosage}</td><td>{fmt(r.date)}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <div className="mh-empty">No prescriptions on file.</div>}
          </div>

          <div className="mh-two">
            <div className="mh-card">
              <div className="mh-card-title">Immunization History</div>
              {vx.length ? (
                <ul className="mh-list">
                  {vx.map(v => (
                    <li key={v.id}>{v.vaccine}: {v.status} <span className="mh-sub">({fmt(v.date)})</span></li>
                  ))}
                </ul>
              ) : <div className="mh-empty">No immunizations recorded.</div>}
            </div>

            <div className="mh-card">
              <div className="mh-card-title">Last Visit</div>
              {last ? (
                <ul className="mh-list">
                  <li>Diagnosis: {last.diagnosis}</li>
                  <li>Visit date: {fmt(last.date)}</li>
                  <li>Doctor: {last.doctor}</li>
                </ul>
              ) : <div className="mh-empty">No visits recorded yet.</div>}
              <div className="mh-next"><strong>Next visit:</strong> {fmt(base.nextVisit)}</div>
            </div>
          </div>

          <div className="mh-card">
            <div className="mh-card-title">Notes (Doctor)</div>
            <div className="mh-note">{med.notes}</div>
          </div>
        </div>
      </div>
    </>
  )
}

function SectionMedicalRecords({ historyName, onOpenHistory, onCloseHistory }) {
  const [rows, setRows]     = useState(INIT_RECORDS)
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [deleteR, setDeleteR] = useState(null)
  const [addF, setAddF]= useState({ patient:'', date:'', diagnosis:'', doctor:'' })

  const filtered = rows.filter(r=>r.patient.toLowerCase().includes(search.toLowerCase())||r.diagnosis.toLowerCase().includes(search.toLowerCase()))

  function doAdd(e) { e.preventDefault(); setRows([...rows,{id:`MR-${String(rows.length+1).padStart(3,'0')}`, ...addF}]); setAddF({patient:'',date:'',diagnosis:'',doctor:''}); setShowAdd(false) }
  function doDelete() { setRows(rows.filter(r=>r.id!==deleteR.id)); setDeleteR(null) }

  if (historyName) return <MedicalHistory name={historyName} records={rows} onBack={onCloseHistory}/>

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
                    <button className="adm-btn-view" title="View medical history" onClick={()=>onOpenHistory(r.patient)}><Eye size={17}/></button>
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
      {deleteR && <Overlay onClose={()=>setDeleteR(null)}><ModalHdr title="Delete Record" onClose={()=>setDeleteR(null)}/>
        <DeleteConfirm onCancel={()=>setDeleteR(null)} onDelete={doDelete}/>
      </Overlay>}
    </>
  )
}

function SectionAppointments() {
  const [rows, setRows]     = useState(INIT_APPTS)
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [viewA,   setViewA]   = useState(null)
  const [deleteA, setDeleteA] = useState(null)
  const [addF, setAddF] = useState({ patient:'', date:'', time:'09:00 AM', service:'General Checkup', doctor:'', status:'Confirmed' })

  const filtered = rows.filter(r=>r.patient.toLowerCase().includes(search.toLowerCase()))

  function doAdd(e) { e.preventDefault(); setRows([...rows,{id:`AP-${String(rows.length+1).padStart(3,'0')}`, ...addF}]); setAddF({patient:'',date:'',time:'09:00 AM',service:'General Checkup',doctor:'',status:'Confirmed'}); setShowAdd(false) }
  function doDelete() { setRows(rows.filter(r=>r.id!==deleteA.id)); setDeleteA(null) }

  return (
    <>
      <div className="adm-panel">
        <PanelHead icon={Calendar} title="Appointments" search={search} setSearch={setSearch} onAdd={()=>setShowAdd(true)}/>
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead><tr><th>ID</th><th>Patient</th><th>Date</th><th>Time</th><th>Service</th><th>Doctor</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(a=>(
                <tr key={a.id}>
                  <td>{a.id}</td><td>{a.patient}</td><td>{fmt(a.date)}</td><td>{a.time}</td>
                  <td>{a.service}</td><td>{a.doctor}</td><td><StatusBadge status={a.status}/></td>
                  <td><div className="adm-actions">
                    <button className="adm-btn-view" onClick={()=>setViewA(a)}><Eye size={17}/></button>
                    <button className="adm-btn-delete" onClick={()=>setDeleteA(a)}><Trash2 size={16}/></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {showAdd && <Overlay onClose={()=>setShowAdd(false)}><ModalHdr title="New Appointment" onClose={()=>setShowAdd(false)}/>
        <div className="adm-modal-body"><form onSubmit={doAdd}>
          <Field label="Patient Name:"><Inp value={addF.patient} placeholder="Patient" onChange={e=>setAddF({...addF,patient:e.target.value})}/></Field>
          <div className="adm-field-row">
            <Field label="Date:"><Inp type="date" value={addF.date} onChange={e=>setAddF({...addF,date:e.target.value})}/></Field>
            <Field label="Time:"><Inp value={addF.time} placeholder="09:00 AM" onChange={e=>setAddF({...addF,time:e.target.value})}/></Field>
          </div>
          <Field label="Service:">
            <select className="adm-inp" value={addF.service} onChange={e=>setAddF({...addF,service:e.target.value})}>
              {['General Checkup','Vaccination','Follow-up','Lab Test','Consultation'].map(s=><option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Doctor:"><Inp value={addF.doctor} placeholder="Doctor name" onChange={e=>setAddF({...addF,doctor:e.target.value})}/></Field>
          <Field label="Status:">
            <select className="adm-inp" value={addF.status} onChange={e=>setAddF({...addF,status:e.target.value})}>
              <option>Confirmed</option><option>Pending</option>
            </select>
          </Field>
          <SubmitBtn label="Book Appointment"/>
        </form></div>
      </Overlay>}
      {viewA && <Overlay onClose={()=>setViewA(null)}><ModalHdr title="Appointment Details" onClose={()=>setViewA(null)}/>
        <div className="adm-modal-body">
          <Field label="ID:"><RO val={viewA.id}/></Field>
          <Field label="Patient:"><RO val={viewA.patient}/></Field>
          <div className="adm-field-row">
            <Field label="Date:"><RO val={fmt(viewA.date)}/></Field>
            <Field label="Time:"><RO val={viewA.time}/></Field>
          </div>
          <Field label="Service:"><RO val={viewA.service}/></Field>
          <Field label="Doctor:"><RO val={viewA.doctor}/></Field>
          <Field label="Status:"><StatusBadge status={viewA.status}/></Field>
        </div>
      </Overlay>}
      {deleteA && <Overlay onClose={()=>setDeleteA(null)}><ModalHdr title="Cancel Appointment" onClose={()=>setDeleteA(null)}/>
        <DeleteConfirm onCancel={()=>setDeleteA(null)} onDelete={doDelete}/>
      </Overlay>}
    </>
  )
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
  const [historyName, setHistoryName] = useState(null)

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab)
      setHistoryName(null)
    }
  }, [location.key])

  function handleNavigate(tab) {
    setActiveTab(tab)
    setHistoryName(null)
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
        .adm-overlay{position:fixed;inset:0;background:rgba(15,30,60,.45);backdrop-filter:blur(3px);display:flex;align-items:center;justify-content:center;z-index:1000;padding:20px}
        .adm-modal{background:#fff;border-radius:18px;width:100%;max-width:500px;max-height:90vh;overflow-y:auto;box-shadow:0 30px 70px rgba(10,30,70,.35);animation:admPop .16s ease-out}
        @keyframes admPop{from{transform:scale(.94);opacity:0}to{transform:scale(1);opacity:1}}
        .adm-modal-hdr{background:linear-gradient(135deg,#1e4d8c 0%,#2a64ad 100%);color:#fff;padding:20px 24px;display:flex;align-items:center;justify-content:space-between;font-size:17px;font-weight:700;letter-spacing:.2px;position:sticky;top:0;z-index:1}
        .adm-modal-close{width:34px;height:34px;border:none;border-radius:50%;background:rgba(255,255,255,.16);color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .15s}
        .adm-modal-close:hover{background:rgba(255,255,255,.28)}
        .adm-modal-body{padding:24px 26px 26px}
        .adm-field{margin-bottom:18px}
        .adm-field label{display:block;font-size:12.5px;font-weight:700;color:#1c5d99;margin-bottom:7px;letter-spacing:.15px}
        .adm-field-row{display:flex;gap:16px;align-items:flex-start}
        .adm-field-row .adm-field{flex:1;min-width:0}
        .adm-grid{display:grid;grid-template-columns:1fr 1fr;gap:0 22px}
        .adm-hero{display:flex;align-items:center;gap:16px;padding:16px 18px;margin-bottom:22px;border-radius:14px;background:linear-gradient(135deg,#eaf2fc 0%,#f5f9fe 100%);border:1px solid #d9e7f7}
        .adm-avatar{width:54px;height:54px;flex-shrink:0;border-radius:50%;background:linear-gradient(135deg,#2a64ad,#1e4d8c);color:#fff;font-size:18px;font-weight:800;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 14px rgba(30,77,140,.28)}
        .adm-hero-name{font-size:16px;font-weight:700;color:#14365f;line-height:1.25}
        .adm-hero-id{display:inline-block;margin-top:6px;font-size:11px;font-weight:700;letter-spacing:.4px;color:#1c5d99;background:#fff;border:1px solid #cfe0f4;border-radius:20px;padding:2px 10px}
        .adm-inp{width:100%;height:42px;border:1px solid #d3deeb;border-radius:9px;padding:0 13px;font-size:14px;font-family:inherit;color:#1f2937;outline:none;box-sizing:border-box;background:#fff;transition:border-color .15s,box-shadow .15s}
        .adm-inp::placeholder{color:#9aa8ba}
        .adm-inp:hover{border-color:#b4c7de}
        .adm-inp:focus{border-color:#1c5d99;box-shadow:0 0 0 3px rgba(28,93,153,.14)}
        .adm-ro{display:flex;align-items:center;min-height:38px;box-sizing:border-box;padding:0 0 9px;border-bottom:1px solid #dfe8f3;font-size:14.5px;font-weight:600;color:#1f2937}
        .adm-gender-row{display:flex;gap:4px;height:42px;box-sizing:border-box;padding:4px;background:#eef4fb;border-radius:11px}
        .adm-gender-opt{flex:1;display:flex;align-items:center;justify-content:center;border-radius:8px;font-size:13.5px;font-weight:600;color:#5f7896;cursor:pointer;transition:background .15s,color .15s,box-shadow .15s;user-select:none}
        .adm-gender-opt:hover{color:#1e4d8c}
        .adm-gender-opt.sel{background:#fff;color:#1e4d8c;box-shadow:0 2px 6px rgba(30,77,140,.16)}
        .adm-submit{width:100%;height:46px;padding:0;border:none;border-radius:10px;background:linear-gradient(135deg,#2a64ad,#1e4d8c);color:#fff;font-size:14.5px;font-weight:700;letter-spacing:.3px;cursor:pointer;margin-top:12px;box-shadow:0 6px 16px rgba(30,77,140,.25);transition:filter .15s}
        .adm-submit:hover{filter:brightness(.92)}
        .adm-del-body{text-align:center;padding:28px 24px 22px}
        .adm-del-icon{width:72px;height:72px;border-radius:50%;border:3px solid #7b1717;display:flex;align-items:center;justify-content:center;margin:0 auto 16px}
        .adm-del-title{font-size:18px;font-weight:800;color:#7b1717;margin-bottom:8px}
        .adm-del-sub{font-size:13px;color:#6b7280;margin-bottom:22px}
        .adm-del-btns{display:flex;gap:12px;justify-content:center}
        .adm-btn-cancel{flex:1;max-width:160px;padding:12px;border:1.5px solid #d1d5db;border-radius:8px;background:#fff;color:#374151;font-size:14px;font-weight:700;cursor:pointer;transition:background .15s}
        .adm-btn-confirm{flex:1;max-width:160px;padding:12px;border:none;border-radius:8px;background:#c0392b;color:#fff;font-size:14px;font-weight:700;cursor:pointer}
        .adm-btn-primary{flex:1;max-width:160px;padding:12px;border:none;border-radius:8px;background:#1e4d8c;color:#fff;font-size:14px;font-weight:700;cursor:pointer}
        .adm-btn-cancel:hover{background:#f3f4f6}
        .adm-btn-confirm:hover,.adm-btn-primary:hover{filter:brightness(.92)}
        .adm-confirm-title{font-size:18px;font-weight:800;color:#1e4d8c;margin-bottom:8px}
        .mh-back{display:inline-flex;align-items:center;gap:8px;background:none;border:none;padding:0;margin:0 0 22px;color:#1c5d99;font-size:14px;font-weight:700;cursor:pointer}
        .mh-back:hover{color:#0e4080;text-decoration:underline}
        .mh-layout{display:grid;grid-template-columns:300px minmax(0,1fr);gap:24px;align-items:start}
        .mh-col{display:flex;flex-direction:column;gap:24px;min-width:0}
        .mh-card{background:#fff;border-radius:14px;padding:24px;box-shadow:0 2px 12px rgba(0,0,0,.07)}
        .mh-card-title{display:flex;align-items:center;gap:8px;font-size:16px;font-weight:700;color:#1c5d99;margin-bottom:16px}
        .mh-profile{text-align:center;padding:30px 24px}
        .mh-avatar{width:120px;height:120px;margin:0 auto 16px;border-radius:50%;background:linear-gradient(135deg,#2a64ad,#1e4d8c);color:#fff;font-size:36px;font-weight:800;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 20px rgba(30,77,140,.28)}
        .mh-name{font-size:19px;font-weight:800;color:#14365f}
        .mh-age{font-size:14px;color:#5f7896;margin-top:4px}
        .mh-info-row{display:flex;justify-content:space-between;gap:12px;padding:11px 0;border-bottom:1px solid #eef2f7;font-size:14px}
        .mh-info-row:last-child{border-bottom:none}
        .mh-info-row span:first-child{color:#5f7896;font-weight:600}
        .mh-info-row span:last-child{color:#1f2937;font-weight:600;text-align:right}
        .mh-vitals{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px}
        .mh-vital{background:#fff;border-radius:14px;padding:22px 16px;text-align:center;box-shadow:0 2px 12px rgba(0,0,0,.07)}
        .mh-vital-icon{color:#1c5d99}
        .mh-vital-label{margin-top:10px;font-size:13.5px;font-weight:700;color:#1c5d99}
        .mh-vital-value{margin-top:6px;font-size:28px;font-weight:800;color:#14365f;line-height:1.1}
        .mh-vital-value small{font-size:12px;font-weight:600;color:#5f7896;margin-left:4px}
        .mh-med-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px}
        .mh-med-label{font-size:12.5px;font-weight:700;color:#1c5d99;margin-bottom:6px}
        .mh-med-value{font-size:15px;font-weight:600;color:#1f2937}
        .mh-list{margin:0;padding-left:18px;font-size:13.5px;color:#374151;line-height:1.75}
        .mh-sub{color:#8a97a8;font-size:12px}
        .mh-two{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px}
        .mh-next{margin-top:14px;padding-top:12px;border-top:1px solid #eef2f7;font-size:13.5px;color:#374151}
        .mh-empty{font-size:13px;color:#8a97a8;font-style:italic}
        .mh-note{border-left:4px solid #f2788d;background:#fdf3f5;border-radius:8px;padding:14px 18px;font-size:14px;line-height:1.7;color:#374151}
        @media(max-width:1100px){.mh-layout{grid-template-columns:1fr}}
        @media(max-width:700px){.mh-vitals,.mh-med-grid,.mh-two{grid-template-columns:1fr}}
        @media(max-width:900px){.kcc-cards{grid-template-columns:1fr}}
      `}</style>

      <AdminSidebar active={activeTab} />

      <main className="dash-main">
        <div className="dash-topbar">
          <h1 className="dash-title">{historyName && activeTab === 'Medical Records' ? 'MEDICAL HISTORY' : activeTab.toUpperCase()}</h1>
        </div>

        {activeTab === 'Dashboard'         && <SectionDashboard patients={INIT_PATIENTS} onNavigate={handleNavigate}/>}
        {activeTab === 'User Management'   && <SectionUserMgmt/>}
        {activeTab === 'Patient Management'&& <SectionPatientMgmt/>}
        {activeTab === 'Medical Records'   && <SectionMedicalRecords historyName={historyName} onOpenHistory={setHistoryName} onCloseHistory={() => setHistoryName(null)}/>}
        {activeTab === 'Appointments'      && <SectionAppointments/>}
        {activeTab === 'Vaccinations'      && <SectionVaccinations/>}
        {activeTab === 'Payments'          && <SectionPayments/>}
        {activeTab === 'Prescriptions'     && <SectionPrescriptions/>}
        {activeTab === 'Reports'           && <SectionReports/>}
      </main>
    </div>
  )
}