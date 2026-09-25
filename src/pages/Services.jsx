import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function Services() {
  const { isLoggedIn } = useAuth()

  return (
    <>
      <Navbar />

      <section className="page-hero">
        <img src="/images/bg-img.jpg" alt="" className="page-hero-bg" />
        <div className="page-hero-overlay"></div>
        <h1 className="page-hero-title">SERVICES</h1>
      </section>

      <section className="service-detail pink">
        <div className="detail-text">
          <h2>CHECKUPS</h2>
          <p>
            <b>KiddoCare</b> offers comprehensive pediatric checkups that focus on monitoring a
            child's overall health and development. The service includes routine physical
            examinations, assessment of growth and vital signs, evaluation of symptoms, and
            medical consultation with a healthcare provider.
          </p>
        </div>
        <div className="detail-img">
          <img src="/images/checkups.webp" alt="Pediatrician checking a baby" />
        </div>
      </section>

      <section className="service-detail blue reverse">
        <div className="detail-img">
          <img src="/images/vaccinations.jpg" alt="Nurse vaccinating a toddler" />
        </div>
        <div className="detail-text">
          <h2>VACCINATIONS</h2>
          <p>
            <b>KiddoCare</b> provides safe, timely pediatric vaccinations by following
            recommended immunization schedules, recording vaccine details, and tracking each
            child's vaccination history to ensure complete and up-to-date protection against
            preventable diseases.
          </p>
        </div>
      </section>

      <section className="service-detail pink">
        <div className="detail-text">
          <h2>IMMUNIZATION</h2>
          <p>
            <b>KiddoCare</b> provides safe and timely immunization services by following
            recommended schedules, accurately recording vaccine details, and tracking each
            child's immunization history to ensure complete and up-to-date protection against
            preventable diseases.
          </p>
        </div>
        <div className="detail-img">
          <img src="/images/immunization.webp" alt="Child receiving an immunization shot" />
        </div>
      </section>

      <section className="appointment-band">
        <img src="/images/bg-img.jpg" alt="" className="band-img" />
        <div className="appointment-card">
          <div className="appointment-info">
            <span className="appointment-eyebrow">Pediatric care, on your schedule</span>
            <h2>Book an appointment</h2>
            <p>Tell us what your child needs and we'll match you with the right visit — usually confirmed the same day.</p>
            <ul className="appointment-perks">
              <li>
                <svg viewBox="0 0 20 20"><path d="M4 10.5l4 4 8-9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                Open slots within this week
              </li>
              <li>
                <svg viewBox="0 0 20 20"><path d="M4 10.5l4 4 8-9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                Licensed pediatricians only
              </li>
              <li>
                <svg viewBox="0 0 20 20"><path d="M4 10.5l4 4 8-9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                Records saved to your account
              </li>
            </ul>
          </div>

          <div className="appointment-main">
            {isLoggedIn ? (
              <AppointmentForm />
            ) : (
              <div className="appointment-gate">
                <h3>You need to make an account first before booking an appointment</h3>
                <p>It takes less than a minute, and your child's records stay in one place from then on.</p>
                <Link to="/signup" className="btn-solid">Sign Up</Link>
                <p className="appointment-gate-alt">
                  Already have an account? <Link to="/login">Log In</Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}

function AppointmentForm() {
  const { user } = useAuth()

  // Limit bookable dates to the current week (doctor availability window)
  const today = new Date()
  const dayOfWeek = today.getDay() // 0 = Sunday
  const endOfWeek = new Date(today)
  endOfWeek.setDate(today.getDate() + (6 - dayOfWeek))
  const toISODate = (d) => d.toISOString().split('T')[0]
  const minDate = toISODate(today)
  const maxDate = toISODate(endOfWeek)

  function handleSubmit(e) {
    e.preventDefault()
    // TODO: wire this up to your backend/API
    alert('Appointment request submitted!')
  }

  return (
    <form className="appointment-form" onSubmit={handleSubmit}>
      <h3 className="appointment-form-title">Your details</h3>

      <div className="form-row">
        <div className="form-group">
          <label>Patient's Name</label>
          <input type="text" value={user?.patientName || ''} readOnly disabled />
        </div>
        <div className="form-group">
          <label>Guardian's Name</label>
          <input type="text" value={user?.guardianName || ''} readOnly disabled />
        </div>
      </div>

      <div className="form-group">
        <label>E-mail</label>
        <input type="email" value={user?.email || ''} readOnly disabled />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="service">Service <span className="required">*</span></label>
          <select id="service" name="service" defaultValue="" required>
            <option value="" disabled>Select appointment type</option>
            <option value="checkup">Checkup</option>
            <option value="vaccination">Vaccination</option>
            <option value="immunization">Immunization</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="date">Date <span className="required">*</span></label>
          <input type="date" id="date" name="date" required min={minDate} max={maxDate} />
        </div>
      </div>
      <p className="field-hint">Appointments can only be booked within this week, based on doctor availability.</p>

      <button type="submit" className="btn-book">
        Book Appointment
        <svg viewBox="0 0 20 20"><path d="M4 10h12M11 5l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
    </form>
  )
}