import { useState } from 'react'
import { Bell, CreditCard, Receipt, Wallet } from 'lucide-react'
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

  const pending = payments.filter((p) => p.status === 'Pending')

  const totalPaid = payments
    .filter((p) => p.status === 'Paid')
    .reduce((sum, p) => sum + p.amount, 0)

  const pendingBalance = pending.reduce(
    (sum, p) => sum + p.amount,
    0
  )

  function savePayments(next) {
    setPayments(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
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

        {/* TOP BAR */}
        <div className="dash-topbar">
          <h1 className="dash-title">PAYMENTS</h1>

          <div className="dash-bell">
            <Bell size={20} />
            <span className="dash-bell-dot" />
          </div>
        </div>

        {/* PAYMENT HISTORY */}
        {view === 'history' && (
          <>
            <div className="pay-summary">

              {/* TOTAL PAID */}
              <div className="pay-summary-card">
                <div>
                  <div className="pay-summary-amount">
                    {peso(totalPaid)}
                  </div>

                  <div className="pay-summary-label">
                    Total Paid
                  </div>
                </div>

                <Receipt
                  size={64}
                  className="pay-summary-icon"
                />
              </div>

              {/* PENDING BALANCE */}
              <div className="pay-summary-card">
                <div>
                  <div className="pay-summary-amount">
                    {pendingBalance > 0
                      ? peso(pendingBalance)
                      : '₱'}
                  </div>

                  <div className="pay-summary-label">
                    Pending Balance
                  </div>
                </div>

                <Wallet
                  size={64}
                  className="pay-summary-icon"
                />
              </div>

            </div>

            {/* PAYMENT HISTORY TABLE */}
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

                        <td>{row.date}</td>

                        <td>{row.service}</td>

                        <td>{peso(row.amount)}</td>

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

            {/* PAY NOW BUTTON */}
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

        {/* PENDING PAYMENTS */}
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

                      <td>{row.date}</td>

                      <td>{row.service}</td>

                      <td>{peso(row.amount)}</td>

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

        {/* PAYMENT FORM */}
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

              {/* TOTAL AMOUNT */}
              <div className="pay-total-bar">

                <span>Total Amount</span>

                <span>
                  {peso(selected.amount)}
                </span>

              </div>

              {/* CONFIRM BUTTON */}
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

      {/* PAYMENT CONFIRMATION MODAL */}
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