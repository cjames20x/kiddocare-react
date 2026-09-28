import { useState } from 'react'
import { Bell, CreditCard } from 'lucide-react'
import DashboardSidebar from '../components/DashboardSidebar.jsx'

const STORAGE_KEY = 'kiddocare-payments'

const INITIAL_PAYMENTS = [
  {
    id: 1,
    date: '2026-01-14',
    service: 'Vaccine',
    amount: 1500,
    status: 'Pending',
  },
  {
    id: 2,
    date: '2026-02-28',
    service: 'Consultation',
    amount: 1200,
    status: 'Pending',
  },
  {
    id: 3,
    date: '2026-03-14',
    service: 'Consultation',
    amount: 2500,
    status: 'Pending',
  },
]

const PAYMENT_MODES = ['Cash', 'Gcash', 'Bank']

function loadPayments() {
  const saved = localStorage.getItem(STORAGE_KEY)

  if (saved) {
    try {
      return JSON.parse(saved)
    } catch (e) {
      console.error(e)
    }
  }

  return INITIAL_PAYMENTS
}

function peso(n) {
  return `₱${Number(n).toLocaleString('en-PH')}`
}

export default function Payments() {
  const [payments, setPayments] = useState(loadPayments)
  const [view, setView] = useState('history')
  const [selected, setSelected] = useState(null)
  const [mode, setMode] = useState('')
  const [confirmed, setConfirmed] = useState(false)

  const pending = payments.filter(
    (p) => p.status === 'Pending'
  )

  const totalPaid = payments
    .filter((p) => p.status === 'Paid')
    .reduce((sum, p) => sum + p.amount, 0)

  const pendingBalance = pending.reduce(
    (sum, p) => sum + p.amount,
    0
  )

  function savePayments(next) {
    setPayments(next)
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(next)
    )
  }

  function pickPending(row) {
    setSelected(row)
    setMode('')
    setView('form')
  }

  function handleConfirm(e) {
    e.preventDefault()

    if (!selected || !mode) return

    const next = payments.map((p) =>
      p.id === selected.id
        ? { ...p, status: 'Paid' }
        : p
    )

    savePayments(next)
    setConfirmed(true)
  }

  function closeModal() {
    setConfirmed(false)
    setSelected(null)
    setMode('')
    setView('history')
  }

  return (
    <div className="dash-layout">
      <DashboardSidebar active="Payments" />

      <main className="dash-main">

        <div className="dash-topbar">
          <h1 className="dash-title">
            PAYMENTS
          </h1>

          <div className="dash-bell">
            <Bell size={20} />
            <span className="dash-bell-dot" />
          </div>
        </div>

        {view === 'history' && (
          <>
            <div className="pay-summary">

              <div className="pay-summary-card">

                <div className="pay-summary-content">

                  <div className="pay-summary-amount">
                    {peso(totalPaid)}
                  </div>

                  <div className="pay-summary-label">
                    Total Paid
                  </div>

                </div>

                <svg
                  className="pay-summary-icon"
                  width="100"
                  height="130"
                  viewBox="0 0 100 130"
                  aria-hidden="true"
                >
                  <path
                    d="
                      M20 8
                      H80
                      V122
                      L70 116
                      L60 122
                      L50 116
                      L40 122
                      L30 116
                      L20 122
                      Z
                    "
                    fill="#4588cd"
                  />

                  <rect
                    x="32"
                    y="35"
                    width="36"
                    height="7"
                    rx="3"
                    fill="#3465ae"
                  />

                  <rect
                    x="32"
                    y="50"
                    width="28"
                    height="6"
                    rx="3"
                    fill="#3465ae"
                  />

                  <rect
                    x="32"
                    y="65"
                    width="36"
                    height="6"
                    rx="3"
                    fill="#3465ae"
                  />

                  <circle
                    cx="50"
                    cy="91"
                    r="14"
                    fill="#3465ae"
                  />

                  <path
                    d="
                      M50 82
                      V100
                      M44 88
                      H55
                      C58 88 58 94 54 94
                      H46
                      C42 94 42 100 46 100
                      H56
                    "
                    stroke="#4588cd"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>

              </div>

              <div className="pay-summary-card">

                <div className="pay-summary-content">

                  <div className="pay-summary-amount">
                    {pendingBalance > 0
                      ? peso(pendingBalance)
                      : '₱0'}
                  </div>

                  <div className="pay-summary-label">
                    Pending Balance
                  </div>

                </div>

                <svg
                  className="pay-summary-icon"
                  width="116"
                  height="130"
                  viewBox="0 0 116 130"
                  aria-hidden="true"
                >
                  <path
                    d="
                      M8 35
                      H98
                      A10 10 0 0 1 108 45
                      V118
                      H8
                      Z
                    "
                    fill="#4588cd"
                  />

                  <rect
                    x="8"
                    y="50"
                    width="100"
                    height="15"
                    rx="3"
                    fill="#3465ae"
                  />

                  <path
                    d="
                      M20 35
                      V25
                      A8 8 0 0 1 28 17
                      H94
                      A8 8 0 0 1 102 25
                      V35
                    "
                    fill="#4588cd"
                  />

                  <rect
                    x="57"
                    y="77"
                    width="51"
                    height="28"
                    rx="6"
                    fill="#3465ae"
                  />

                  <circle
                    cx="68"
                    cy="91"
                    r="5"
                    fill="#4588cd"
                  />

                  <rect
                    x="20"
                    y="78"
                    width="25"
                    height="5"
                    rx="2"
                    fill="#3465ae"
                  />

                  <rect
                    x="20"
                    y="90"
                    width="18"
                    height="5"
                    rx="2"
                    fill="#3465ae"
                  />
                </svg>

              </div>

            </div>

            <section className="dash-panel">

              <h3>
                <CreditCard size={20} />
                Payment History
              </h3>

              <div style={{ overflowX: 'auto' }}>

                <table className="dash-table">

                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Service</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>

                    {payments.map((row) => (

                      <tr key={row.id}>

                        <td>
                          {row.date}
                        </td>

                        <td>
                          {row.service}
                        </td>

                        <td>
                          {peso(row.amount)}
                        </td>

                        <td>

                          <span
                            className={`pay-status pay-status--${row.status.toLowerCase()}`}
                          >
                            {row.status}
                          </span>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            </section>

            {pendingBalance > 0 && (

              <div className="pay-now-wrap">

                <button
                  type="button"
                  className="pay-now-btn"
                  onClick={() => setView('pending')}
                >
                  Pay Now
                </button>

              </div>

            )}

          </>
        )}

        {view === 'pending' && (

          <section className="dash-panel">

            <h3>
              <CreditCard size={20} />
              Pending Payments
            </h3>

            <p className="pay-pending-hint">
              Select a pending payment to continue.
            </p>

            <div style={{ overflowX: 'auto' }}>

              <table className="dash-table">

                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Service</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>

                  {pending.map((row) => (

                    <tr
                      key={row.id}
                      className="pay-pending-row"
                      onClick={() => pickPending(row)}
                    >

                      <td>
                        {row.date}
                      </td>

                      <td>
                        {row.service}
                      </td>

                      <td>
                        {peso(row.amount)}
                      </td>

                      <td>
                        <span className="pay-status pay-status--pending">
                          {row.status}
                        </span>
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </section>

        )}

        {view === 'form' && selected && (

          <section
            className={`dash-panel pay-form-panel${
              confirmed ? ' is-blurred' : ''
            }`}
          >

            <form onSubmit={handleConfirm}>

              <label className="pay-label">
                Mode of Payment:
              </label>

              <div className="pay-modes pay-modes--form">

                {PAYMENT_MODES.map((option) => (

                  <label
                    key={option}
                    className="pay-mode"
                  >

                    <input
                      type="radio"
                      name="mode"
                      value={option}
                      checked={mode === option}
                      onChange={(e) =>
                        setMode(e.target.value)
                      }
                      required
                    />

                    {option}

                  </label>

                ))}

              </div>

              <div className="pay-total-bar">

                <span>
                  Total Amount
                </span>

                <span>
                  {peso(selected.amount)}
                </span>

              </div>

              <div className="pay-now-wrap">

                <button
                  type="submit"
                  className="pay-now-btn"
                >
                  Confirm Payment
                </button>

              </div>

            </form>

          </section>

        )}

      </main>

      {confirmed && (

        <div className="confirm-overlay">

          <div
            className="doc-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="doc-modal-header">
              PAYMENT
            </div>

            <div className="doc-modal-body">

              <div className="doc-success-icon">
                ✓
              </div>

              <h3 className="pay-modal-title">
                Payment Confirmed!
              </h3>

              <p>
                The payment is confirmed successfully!
              </p>

              <button
                className="btn-primary"
                onClick={closeModal}
              >
                OK
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  )
}