import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function Home() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isLoggedIn } = useAuth()

  useEffect(() => {
    if (location.hash) {
      const el = document.querySelector(location.hash)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }
  }, [location])

  return (
    <>
      <Navbar />

      <section className="hero">
        <img src="/images/hero.png" alt="" className="hero-bg" />
        <div className="hero-overlay"></div>
        <div className="hero-content">
          {isLoggedIn ? (
            <>
              <h1>WELCOME BACK</h1>
              <p className="hero-sub">Your child's records, appointments, and vaccinations, all in one place.</p>
              <button className="btn-cta" onClick={() => navigate('/services')}>Book an Appointment</button>
            </>
          ) : (
            <>
              <h1>KIDDOCARE</h1>
              <p className="hero-sub">Advanced Pediatric Management System for Modern Clinics</p>
              <p className="hero-tag">Streamline operations &bull; Improve patient care &bull; Boost vaccination coverage</p>
              <button className="btn-cta">Get Started</button>
            </>
          )}
        </div>
      </section>

      <section className="services" id="services">
        <h2>Our Services</h2>
        <div className="service-grid">
          {SERVICES.map((s) => (
            <div className="service-card" key={s.title}>
              <svg className="s-icon" viewBox="0 0 48 48">{s.icon}</svg>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="about" id="about">
        <h2>About KiddoCare</h2>
        <p className="about-tag">Transforming Pediatric Healthcare Management</p>
        <div className="about-content">
          <div className="about-text">
            <p>
              <span className="highlight">KiddoCare</span> is a comprehensive pediatric clinic
              management system designed to streamline healthcare services for children. We
              understand the unique challenges parents and healthcare providers face when
              managing children's medical care, and we've created a solution that makes it
              simpler, faster, and more efficient.
            </p>
            <p>
              Our mission is to ensure every child receives timely, quality healthcare by
              connecting parents with expert pediatricians and making medical records easily
              accessible.
            </p>
          </div>
          <img src="/images/children.png" alt="Mother and child" className="about-img" />
        </div>
      </section>

      <section className="why-choose">
        <h2>Why Choose KiddoCare?</h2>
        <div className="feature-grid">
          {FEATURES.map((f) => (
            <div className="feature-card" key={f.title}>
              <svg className="f-icon" viewBox="0 0 48 48">{f.icon}</svg>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </>
  )
}

const SERVICES = [
  {
    title: 'Expert Pediatricians',
    desc: 'Access to qualified pediatric doctors for consultations and medical advice',
    icon: <path d="M24 6v10M24 6c-3 0-4 2-4 4s1 4 4 4 4 2 4 4-1 4-4 4M14 22c0 8 4 14 10 18M34 22c0 8-4 14-10 18M14 22a4 4 0 100-8 4 4 0 000 8zM34 22a4 4 0 100-8 4 4 0 000 8z" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" />,
  },
  {
    title: 'Easy Appointments',
    desc: 'Schedule appointments online with convenient date and time slots',
    icon: (
      <>
        <rect x="9" y="9" width="30" height="30" rx="3" fill="none" stroke="#fff" strokeWidth="2" />
        <line x1="9" y1="18" x2="39" y2="18" stroke="#fff" strokeWidth="2" />
        <line x1="16" y1="6" x2="16" y2="12" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        <line x1="32" y1="6" x2="32" y2="12" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        <rect x="15" y="24" width="5" height="5" fill="#fff" />
        <rect x="28" y="24" width="5" height="5" fill="#fff" />
        <rect x="15" y="31" width="5" height="5" fill="#fff" />
      </>
    ),
  },
  {
    title: 'Vaccination Tracking',
    desc: 'Complete immunization records and vaccination schedule management',
    icon: (
      <>
        <path d="M30 9l9 9-15 15H15v-9L30 9z" fill="none" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
        <line x1="26" y1="13" x2="35" y2="22" stroke="#fff" strokeWidth="2" />
        <circle cx="12" cy="36" r="2.5" fill="#fff" />
      </>
    ),
  },
  {
    title: 'Medical Records',
    desc: 'Secure storage of medical history, diagnoses, and health information',
    icon: (
      <>
        <path d="M14 6h20v36H14z" fill="none" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
        <line x1="19" y1="16" x2="29" y2="16" stroke="#fff" strokeWidth="2" />
        <polyline points="19,26 22,26 24,22 26,30 28,26 29,26" fill="none" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
      </>
    ),
  },
  {
    title: 'Prescription Management',
    desc: 'Digital prescriptions and medication tracking for your child',
    icon: (
      <>
        <path d="M14 6h20v36H14z" fill="none" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
        <line x1="18" y1="16" x2="30" y2="16" stroke="#fff" strokeWidth="2" />
        <line x1="18" y1="22" x2="30" y2="22" stroke="#fff" strokeWidth="2" />
        <circle cx="21" cy="30" r="2" fill="#fff" />
      </>
    ),
  },
  {
    title: 'Online Payments',
    desc: 'Secure payment processing and billing management',
    icon: (
      <>
        <rect x="6" y="14" width="36" height="24" rx="3" fill="none" stroke="#fff" strokeWidth="2" />
        <line x1="6" y1="20" x2="42" y2="20" stroke="#fff" strokeWidth="2" />
        <line x1="12" y1="30" x2="22" y2="30" stroke="#fff" strokeWidth="2" />
      </>
    ),
  },
  {
    title: 'Health Reports',
    desc: 'Detailed health reports and downloadable medical documents',
    icon: (
      <>
        <path d="M14 6h20v36H14z" fill="none" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
        <polyline points="18,28 22,20 26,26 30,16" fill="none" stroke="#fff" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      </>
    ),
  },
  {
    title: 'Notifications',
    desc: 'Real-time alerts for appointments, vaccinations, and health updates',
    icon: (
      <>
        <path d="M24 6c-6 0-9 5-9 11v6l-4 6h26l-4-6v-6c0-6-3-11-9-11z" fill="none" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
        <path d="M20 33a4 4 0 008 0" fill="none" stroke="#fff" strokeWidth="2" />
      </>
    ),
  },
]

const FEATURES = [
  {
    title: 'SECURE & PRIVATE',
    desc: "Your child's medical data is encrypted and protected with HIPAA compliance",
    icon: (
      <>
        <path d="M24 4l16 6v11c0 11-7 18-16 23-9-5-16-12-16-23V10z" fill="none" stroke="#2c5aa0" strokeWidth="2.2" strokeLinejoin="round" />
        <circle cx="24" cy="21" r="4" fill="none" stroke="#2c5aa0" strokeWidth="2.2" />
        <line x1="24" y1="25" x2="24" y2="31" stroke="#2c5aa0" strokeWidth="2.2" strokeLinecap="round" />
      </>
    ),
  },
  {
    title: 'FAST & EFFICIENT',
    desc: 'Quick consultations, instant prescriptions, and paperless transactions',
    icon: <polygon points="26,4 10,26 22,26 20,44 38,20 25,20" fill="none" stroke="#2c5aa0" strokeWidth="2.2" strokeLinejoin="round" />,
  },
  {
    title: 'MOBILE FRIENDLY',
    desc: 'Access your accounts from any device, anywhere, anytime',
    icon: (
      <>
        <rect x="14" y="4" width="20" height="40" rx="3" fill="none" stroke="#2c5aa0" strokeWidth="2.2" />
        <line x1="14" y1="35" x2="34" y2="35" stroke="#2c5aa0" strokeWidth="2.2" />
        <circle cx="24" cy="39" r="1.5" fill="#2c5aa0" />
      </>
    ),
  },
  {
    title: '24/7 SUPPORT',
    desc: 'Round-the-clock customer support for all your concerns',
    icon: (
      <>
        <circle cx="24" cy="24" r="18" fill="none" stroke="#2c5aa0" strokeWidth="2.2" />
        <polyline points="24,14 24,24 31,29" fill="none" stroke="#2c5aa0" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
]
