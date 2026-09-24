import { useState } from 'react'
import { Bell, Users, HeartHandshake, ChevronDown } from 'lucide-react'
import DashboardSidebar from '../components/DashboardSidebar.jsx'

const CATEGORIES = [
  {
    key: 'parents',
    label: 'Parents & Guardians',
    icon: Users,
    faqs: [
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
        q: 'How to Contact the Clinic',
        steps: [
          'Open the Feedback Page within your portal.',
          'Type in your message or inquiry.',
          'Submit the form to send it directly to the clinic staff.',
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
    ],
  },
  {
    key: 'staff',
    label: 'Clinic Staff & Administrators',
    icon: HeartHandshake,
    faqs: [
      {
        q: 'How to Register a New Patient',
        steps: [
          'Log in to the system using your username and password on the Login Page.',
          'Navigate to the Patient Management Page.',
          "Fill out the required demographic fields, which include the patient's name, birth date, guardian name, contact number, and address.",
          'Save the profile.',
        ],
      },
      {
        q: 'How to Schedule or Modify an Appointment',
        steps: [
          'Navigate to the Appointment Management Page.',
          "View the clinic's schedule using the daily, weekly, or monthly calendar views.",
          'Schedule a new patient with a doctor, or select an existing appointment to approve, reschedule, or cancel it.',
          'Pay attention to automated alerts; the system will notify you if an appointment overlaps with another booking.',
        ],
      },
      {
        q: 'How to Track and Log Vaccinations',
        steps: [
          'Go to the Vaccination Tracking Page.',
          'Record a new immunization by logging the vaccine name and the date it was administered.',
          'Monitor the page for automated system alerts that notify staff of upcoming or overdue vaccines.',
        ],
      },
    ],
  },
]

export default function Help() {
  const [activeCat, setActiveCat] = useState('parents')
  const [openIdx, setOpenIdx] = useState(0)

  const category = CATEGORIES.find((c) => c.key === activeCat)

  function selectCategory(key) {
    setActiveCat(key)
    setOpenIdx(0)
  }

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

        <section className="dash-panel help-panel">
          <p className="help-intro">Find quick answers to the most common questions, grouped by who you are.</p>

          <div className="help-tabs">
            {CATEGORIES.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                className={`help-tab${key === activeCat ? ' active' : ''}`}
                onClick={() => selectCategory(key)}
              >
                <Icon size={16} /> {label}
              </button>
            ))}
          </div>

          <div className="help-accordion">
            {category.faqs.map((faq, i) => {
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
    </div>
  )
}
