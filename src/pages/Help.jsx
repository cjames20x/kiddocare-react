import { useState, useEffect } from 'react'
import { Bell, Users, MessageCircleQuestion, ChevronDown, X, Send, CheckCircle2 } from 'lucide-react'
import DashboardSidebar from '../components/DashboardSidebar.jsx'

const FAQS = [
  {
    q: 'How to Book and Check an Appointment',
    steps: [
      'Log in to your account via the Registration and Login Page.',
      'Navigate to the Appointment Booking Page.',
      'Follow the prompts to schedule an appointment for your child.',
      'To verify your booking, visit the Appointment Status Page where you can view your schedule and current status.',
    ],
  },
  {
    q: 'How to Reschedule or Cancel an Appointment',
    steps: [
      'Go to the Appointments page from the sidebar.',
      'Find the appointment you want to change.',
      'Choose Reschedule to pick a new date and time, or Cancel to remove the booking.',
      'Check the Appointments page again to confirm the updated status.',
    ],
  },
  {
    q: "How to Register Your Child",
    steps: [
      'Open the Register Child page from the sidebar.',
      "Fill in your child's name, birth date, guardian name, contact number, and address.",
      'Review the details, then save the profile.',
      'Your child will now appear on the Child Information page and can be selected when booking.',
    ],
  },
  {
    q: 'How to Check Upcoming and Completed Vaccinations',
    steps: [
      'Go to the Vaccinations page.',
      "Review the list of your child's vaccines, including the date administered and current status.",
      'Take note of any upcoming or overdue vaccines and book an appointment if one is due.',
    ],
  },
  {
    q: 'How to Access Vaccination Records and Payment Receipts',
    steps: [
      'Log in to your KiddoCare account.',
      'Navigate to the Downloadable Documents Page.',
      'Select the specific file you need, such as a vaccination record or a payment receipt.',
      'Download the document directly to your device.',
    ],
  },
]

const TOPICS = ['Appointments', 'Child Information', 'Vaccinations', 'Payments', 'Documents', 'Account', 'Other']

function AskModal({ onClose }) {
  const [topic, setTopic] = useState(TOPICS[0])
  const [question, setQuestion] = useState('')
  const [sent, setSent] = useState(false)

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function handleSubmit(e) {
    e.preventDefault()
    if (!question.trim()) return
    // TODO: send { topic, question } to your backend / inquiries table
    console.log('Help inquiry submitted:', { topic, question: question.trim() })
    setSent(true)
  }

  return (
    <div className="confirm-overlay" onClick={onClose}>
      <div className="help-dialog" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="help-dialog-head">
          <h3>{sent ? 'Question Sent' : 'Need Help?'}</h3>
          <button type="button" className="help-dialog-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {sent ? (
          <div className="help-dialog-body help-dialog-success">
            <CheckCircle2 size={48} />
            <p>Thanks! The clinic staff received your question and will get back to you soon.</p>
            <button type="button" className="help-submit" onClick={onClose}>Done</button>
          </div>
        ) : (
          <form className="help-dialog-body" onSubmit={handleSubmit}>
            <p className="help-dialog-sub">Can't find your answer? Send your question straight to the clinic.</p>

            <div className="dash-form-group">
              <label htmlFor="help-topic">Topic</label>
              <select id="help-topic" value={topic} onChange={(e) => setTopic(e.target.value)}>
                {TOPICS.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>

            <div className="dash-form-group">
              <label htmlFor="help-question">Your question <span className="dash-required">*</span></label>
              <textarea
                id="help-question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Type your question here..."
                required
              />
            </div>

            <button type="submit" className="help-submit">
              <Send size={16} /> Submit Question
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default function Help() {
  const [openIdx, setOpenIdx] = useState(-1)
  const [askOpen, setAskOpen] = useState(false)

  return (
    <div className="dash-layout">
      <DashboardSidebar active="Help" />
      <main className="dash-main">
        <div className="dash-topbar">
          <h1 className="dash-title">HELP</h1>
          <div className="dash-bell">
            <Bell size={20} />
            <span className="dash-bell-dot" />
          </div>
        </div>

        <section className={`dash-panel help-panel${askOpen ? ' is-blurred' : ''}`}>
          <p className="help-intro">Find quick answers to the most common questions, or send us your own.</p>

          <div className="help-tabs">
            <span className="help-tab active">
              <Users size={16} /> Parents &amp; Guardians
            </span>
            <button type="button" className="help-need-btn" onClick={() => setAskOpen(true)}>
              <MessageCircleQuestion size={16} /> Need Help?
            </button>
          </div>

          <div className="help-accordion">
            {FAQS.map((faq, i) => {
              const isOpen = i === openIdx
              return (
                <div key={faq.q} className={`help-acc-item${isOpen ? ' open' : ''}`}>
                  <button
                    type="button"
                    className="help-acc-head"
                    onClick={() => setOpenIdx(isOpen ? -1 : i)}
                  >
                    <span>{faq.q}</span>
                    <ChevronDown size={18} className="help-acc-chevron" />
                  </button>
                  <div className="help-acc-body">
                    <ol className="help-steps">
                      {faq.steps.map((s, si) => <li key={si}>{s}</li>)}
                    </ol>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </main>

      {askOpen && <AskModal onClose={() => setAskOpen(false)} />}
    </div>
  )
}