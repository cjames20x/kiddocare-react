import { useState, useEffect } from 'react'
import {
  Syringe, Search, Eye, X, Calendar, User, Clock,
  CheckCircle, AlertCircle, RefreshCw, ShieldCheck
} from 'lucide-react'
import DashboardSidebar from '../components/DashboardSidebar.jsx'
import NotificationButton from '../components/NotificationButton.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { listVaccinations, listMyPatients } from '../lib/api.js'

function fmt(d) {
  if (!d || d === '—' || d === 'N/A' || d === 'null' || d === 'undefined') return '—'
  const clean = String(d).split('T')[0].trim()
  if (!clean || clean === '—' || clean === 'N/A') return '—'
  const dt = new Date(clean + 'T00:00:00')
  if (isNaN(dt.getTime())) {
    const direct = new Date(d)
    if (!isNaN(direct.getTime())) {
      return direct.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }
    return clean
  }
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function Vaccinations() {
  const { accessToken } = useAuth()
  const [records, setRecords] = useState([])
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [childFilter, setChildFilter] = useState('All')
  const [viewRecord, setViewRecord] = useState(null)

  async function loadData() {
    if (!accessToken) return
    setLoading(true)
    setError('')
    try {
      const [vaxList, pats] = await Promise.all([
        listVaccinations(accessToken).catch(() => []),
        listMyPatients(accessToken).catch(() => []),
      ])
      if (Array.isArray(vaxList)) {
        setRecords(vaxList)
      }
      if (Array.isArray(pats)) {
        setPatients(pats)
      }
    } catch (err) {
      setError(err.message || 'Failed to load live vaccination records.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [accessToken])

  const filtered = records.filter((r) => {
    const pName = (r.patient_name || '').toLowerCase()
    const vName = (r.vaccine_name || '').toLowerCase()
    const dName = (r.doctor_name || '').toLowerCase()
    const q = search.toLowerCase()
    const matchesSearch = pName.includes(q) || vName.includes(q) || dName.includes(q)
    const matchesChild = childFilter === 'All' || String(r.patient_id) === String(childFilter)
    return matchesSearch && matchesChild
  })

  // Pending count = vaccinations with scheduled next due date
  const pendingCount = records.filter((r) => r.status === 'Pending' || Boolean(r.next_due_date)).length
  const completedCount = records.filter((r) => r.status === 'Completed' || (!r.next_due_date && r.status !== 'Pending')).length

  return (
    <div className="dash-layout">
      <DashboardSidebar active="Vaccinations" />

      <main className="dash-main">
        <div className="dash-topbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 className="dash-title">VACCINATIONS & IMMUNIZATION</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#059669', background: '#ecfdf5', padding: '5px 12px', borderRadius: '16px', fontWeight: 600 }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
              Live Supabase Records
            </span>
            <NotificationButton />
          </div>
        </div>

        {/* Quick Summary Cards */}
        <div className="kcc-cards" style={{ marginBottom: '20px' }}>
          <div className="kcc-card">
            <div className="kcc-text">
              <div className="kcc-num">{records.length}</div>
              <div className="kcc-label">Doses Administered</div>
            </div>
            <svg className="kcc-icon" width="100" height="130" viewBox="0 0 100 130" aria-hidden="true">
              <g transform="rotate(35 50 85)">
                <rect x="38" y="40" width="24" height="70" rx="5" fill="#4588cd" />
                <rect x="30" y="34" width="40" height="8" rx="3" fill="#3465ae" />
                <rect x="47" y="14" width="6" height="22" fill="#3465ae" />
                <rect x="46" y="110" width="8" height="20" fill="#3465ae" />
              </g>
            </svg>
          </div>
          <div className="kcc-card">
            <div className="kcc-text">
              <div className="kcc-num" style={{ color: '#b45309' }}>{pendingCount}</div>
              <div className="kcc-label">Pending Follow-up Doses</div>
            </div>
            <svg className="kcc-icon" width="100" height="130" viewBox="0 0 100 130" aria-hidden="true">
              <path d="M12 32 H89 A10 10 0 0 1 99 42 V130 H2 V42 A10 10 0 0 1 12 32 Z" fill="#f59e0b" />
              <rect x="10" y="40" width="80" height="18" rx="3" fill="#d97706" />
              <rect x="45" y="71" width="27" height="27" rx="7" fill="#d97706" />
            </svg>
          </div>
          <div className="kcc-card">
            <div className="kcc-text">
              <div className="kcc-num" style={{ color: '#059669' }}>{completedCount}</div>
              <div className="kcc-label">Completed Series</div>
            </div>
            <svg className="kcc-icon" width="100" height="130" viewBox="0 0 100 130" aria-hidden="true">
              <rect x="24" y="27" width="54" height="57" rx="26" fill="#10b981" />
              <path d="M0 130 C0 110 22 99 50 99 C78 99 100 110 100 130 Z" fill="#10b981" />
            </svg>
          </div>
        </div>

        <section className="dash-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Syringe size={20} color="var(--blue)" /> Child Immunization History
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {/* Child Filter Dropdown */}
              {patients.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Child:</label>
                  <select
                    value={childFilter}
                    onChange={(e) => setChildFilter(e.target.value)}
                    style={{
                      padding: '7px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '12.5px',
                      background: '#fff',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <option value="All">All Children</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>{p.patient_name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Search Bar */}
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="Search vaccine, doctor..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    padding: '7px 32px 7px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '12.5px',
                    width: '200px',
                    outline: 'none',
                  }}
                />
                <Search size={15} style={{ position: 'absolute', right: '10px', color: '#94a3b8' }} />
              </div>

              {/* Reload Button */}
              <button
                type="button"
                onClick={loadData}
                title="Refresh vaccination records"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '7px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                  color: '#475569',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <RefreshCw size={14} className={loading ? 'spin' : ''} />
                Refresh
              </button>
            </div>
          </div>

          {error && (
            <div style={{ padding: '12px 16px', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>
              {error}
            </div>
          )}

          <div style={{ overflowX: 'auto' }}>
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Child / Patient</th>
                  <th>Vaccine</th>
                  <th>Dose #</th>
                  <th>Date Administered</th>
                  <th>Next Due Date</th>
                  <th>Attending Doctor</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center' }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', color: '#0284c7', padding: '32px' }}>
                      Loading live vaccination records from clinic database…
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="vax-empty">
                      No vaccination records found. Records logged by clinic doctors will appear here live with upcoming due dates.
                    </td>
                  </tr>
                ) : (
                  filtered.map((row, idx) => {
                    const isPending = row.status === 'Pending' || (row.next_due_date && row.next_due_date !== '—')
                    const statusText = isPending ? 'Pending' : 'Completed'
                    const badgeStyle = isPending
                      ? { background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', padding: '4px 12px', borderRadius: '14px', fontWeight: 700, fontSize: '12px', display: 'inline-block' }
                      : { background: '#d1fae5', color: '#065f46', border: '1px solid #a7f3d0', padding: '4px 12px', borderRadius: '14px', fontWeight: 700, fontSize: '12px', display: 'inline-block' }

                    return (
                      <tr key={row.id || idx}>
                        <td><strong>{row.patient_name || 'Child'}</strong></td>
                        <td style={{ color: '#0369a1', fontWeight: 600 }}>{row.vaccine_name || 'Vaccine'}</td>
                        <td>Dose {row.dose_number || 1}</td>
                        <td>{fmt(row.date_administered)}</td>
                        <td style={{ fontWeight: 600, color: isPending ? '#b45309' : '#475569' }}>
                          {fmt(row.next_due_date)}
                        </td>
                        <td>{row.doctor_name || 'Attending Pediatrician'}</td>
                        <td>
                          <span style={badgeStyle}>
                            {statusText}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => setViewRecord(row)}
                            title="View Full Vaccination Details"
                            style={{
                              padding: '5px 8px',
                              borderRadius: '6px',
                              border: '1px solid #cbd5e1',
                              background: '#fff',
                              color: 'var(--blue)',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* View Details Modal */}
        {viewRecord && (
          <div
            className="kcmr-backdrop"
            onClick={() => setViewRecord(null)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(15, 23, 42, 0.45)',
              display: 'grid',
              placeItems: 'center',
              zIndex: 1000,
              padding: '16px',
            }}
          >
            <div
              className="kcmr-modal"
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#fff',
                width: '100%',
                maxWidth: '520px',
                borderRadius: '16px',
                boxShadow: '0 20px 45px rgba(0, 0, 0, 0.2)',
                overflow: 'hidden',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#e0f2fe', color: '#0369a1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Syringe size={20} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '17px', color: '#1e293b' }}>Vaccination Details</h3>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>Record ID #{viewRecord.id}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setViewRecord(null)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ padding: '22px 24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Child / Patient</div>
                    <div style={{ fontSize: '14.5px', fontWeight: 700, color: '#1e293b', marginTop: '3px' }}>
                      {viewRecord.patient_name || 'Child'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Vaccine Name</div>
                    <div style={{ fontSize: '14.5px', fontWeight: 700, color: '#0369a1', marginTop: '3px' }}>
                      {viewRecord.vaccine_name || 'Vaccine'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Dose Number</div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#334155', marginTop: '3px' }}>
                      Dose {viewRecord.dose_number || 1}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Administering Doctor</div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#334155', marginTop: '3px' }}>
                      {viewRecord.doctor_name || 'Attending Doctor'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Date Administered</div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#334155', marginTop: '3px' }}>
                      {fmt(viewRecord.date_administered)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Next Due Date</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#b45309', marginTop: '3px' }}>
                      {fmt(viewRecord.next_due_date)}
                    </div>
                  </div>
                </div>

                {/* Status Notice Banner */}
                {viewRecord.next_due_date && viewRecord.next_due_date !== '—' ? (
                  <div style={{ padding: '12px 14px', background: '#fef3c7', borderRadius: '10px', border: '1px solid #fde68a', display: 'flex', gap: '10px', alignItems: 'flex-start', marginTop: '12px' }}>
                    <AlertCircle size={18} color="#b45309" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div style={{ fontSize: '12.5px', color: '#92400e', lineHeight: 1.5 }}>
                      <strong>Follow-up Dose Pending:</strong> The next dose for this vaccine series is scheduled for <strong>{fmt(viewRecord.next_due_date)}</strong>. Status remains <em>Pending</em> until all doses in the series are administered.
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '12px 14px', background: '#ecfdf5', borderRadius: '10px', border: '1px solid #a7f3d0', display: 'flex', gap: '10px', alignItems: 'center', marginTop: '12px' }}>
                    <CheckCircle size={18} color="#059669" style={{ flexShrink: 0 }} />
                    <div style={{ fontSize: '12.5px', color: '#065f46' }}>
                      <strong>Series Completed:</strong> All recommended doses for this vaccine course have been successfully administered.
                    </div>
                  </div>
                )}
              </div>

              <div style={{ padding: '14px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', textAlign: 'right' }}>
                <button
                  type="button"
                  onClick={() => setViewRecord(null)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#fff',
                    color: '#334155',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
