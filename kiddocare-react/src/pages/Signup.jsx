import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { useAuth } from '../context/AuthContext.jsx'

const PH_PHONE_PATTERN = '^09[0-9]{9}$'
// at least one letter, one number, one special character, 8+ chars
const PASSWORD_PATTERN = '^(?=.*[A-Za-z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,}$'

export default function Signup() {
  const [step, setStep] = useState(1)
  const [showPw1, setShowPw1] = useState(false)
  const [showPw2, setShowPw2] = useState(false)
  const [form, setForm] = useState({
    guardianName: '', patientName: '', dob: '', gender: '',
    email: '', password: '', confirmPassword: '',
    address: '', contactNumber: '', relationship: '',
  })
  const [agreed, setAgreed] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function handleFinish(e) {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      alert("Passwords don't match.")
      return
    }
    setStep('done')
  }

  const StepBar = ({ upTo }) => (
    <div className="step-bar">
      {[1, 2, 3].map((n) => <span key={n} className={n <= upTo ? 'active' : ''}></span>)}
    </div>
  )

  return (
    <>
      <Navbar />
      <div className="auth-body">
        <div className="auth-bg"></div>
        <div className="auth-overlay"></div>

        {step === 1 && (
          <div className="auth-card auth-step active">
            <img src="/images/kiddocare-logo.png" alt="KiddoCare" className="auth-logo" />
            <h2>Create an account</h2>
            <p className="auth-sub">Register to manage your child's health records</p>
            <p className="step-label">Step 1 of 3</p>
            <StepBar upTo={1} />
            <form onSubmit={(e) => { e.preventDefault(); setStep(2) }}>
              <div className="form-group">
                <label>Guardian's Name:</label>
                <input type="text" placeholder="Juan Dela Cruz" required
                  value={form.guardianName} onChange={(e) => update('guardianName', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Patient's Name:</label>
                <input type="text" placeholder="Jomari Dela Cruz" required
                  value={form.patientName} onChange={(e) => update('patientName', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Patient's Date of Birth:</label>
                <input type="date" required
                  value={form.dob} onChange={(e) => update('dob', e.target.value)} />
              </div>
              <div className="gender-group">
                <label>Patient's Gender:</label>
                <div className="gender-options">
                  <label className="gender-option">
                    <input type="radio" name="gender" value="male" required
                      checked={form.gender === 'male'} onChange={(e) => update('gender', e.target.value)} />
                    <span className="g-icon">♂</span><span className="g-label">Male</span>
                  </label>
                  <label className="gender-option">
                    <input type="radio" name="gender" value="female"
                      checked={form.gender === 'female'} onChange={(e) => update('gender', e.target.value)} />
                    <span className="g-icon">♀</span><span className="g-label">Female</span>
                  </label>
                </div>
              </div>
              <button type="submit" className="btn-primary">Continue →</button>
            </form>
            <p className="auth-links">Already have an account? <Link to="/login">Log In</Link></p>
          </div>
        )}

        {step === 2 && (
          <div className="auth-card auth-step active">
            <img src="/images/kiddocare-logo.png" alt="KiddoCare" className="auth-logo" />
            <h2>Create an account</h2>
            <p className="auth-sub">Register to manage your child's health records</p>
            <p className="step-label">Step 2 of 3</p>
            <StepBar upTo={2} />
            <form onSubmit={(e) => { e.preventDefault(); setStep(3) }}>
              <div className="form-group">
                <label>Email:</label>
                <input type="email" placeholder="juan@gmail.com" required
                  value={form.email} onChange={(e) => update('email', e.target.value)} />
              </div>
              <div className="form-group password-wrap">
                <label>Password:</label>
                <input type={showPw1 ? 'text' : 'password'} placeholder="Create a password" required
                  pattern={PASSWORD_PATTERN}
                  title="At least 8 characters, including a letter, a number, and a special character"
                  value={form.password} onChange={(e) => update('password', e.target.value)} />
                <button type="button" className="toggle-pw" onClick={() => setShowPw1(!showPw1)}>👁</button>
              </div>
              <p className="field-hint">At least 8 characters, with a letter, a number, and a special character (e.g. !@#$%)</p>
              <div className="form-group password-wrap">
                <label>Confirm Password:</label>
                <input type={showPw2 ? 'text' : 'password'} placeholder="Re-enter password" required
                  value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} />
                <button type="button" className="toggle-pw" onClick={() => setShowPw2(!showPw2)}>👁</button>
              </div>
              <button type="submit" className="btn-primary">Continue →</button>
              <button type="button" className="btn-secondary" onClick={() => setStep(1)}>← Back</button>
            </form>
          </div>
        )}

        {step === 3 && (
          <div className="auth-card auth-step active">
            <img src="/images/kiddocare-logo.png" alt="KiddoCare" className="auth-logo" />
            <h2>Create an account</h2>
            <p className="auth-sub">Register to manage your child's health records</p>
            <p className="step-label">Step 3 of 3</p>
            <StepBar upTo={3} />
            <form onSubmit={handleFinish}>
              <div className="form-group">
                <label>Address:</label>
                <input type="text" placeholder="House No., Street No., Brgy, City, Province" required
                  value={form.address} onChange={(e) => update('address', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Contact No.:</label>
                <input type="tel" placeholder="09XXXXXXXXX" required
                  pattern={PH_PHONE_PATTERN} maxLength={11}
                  title="Enter an 11-digit PH mobile number starting with 09"
                  value={form.contactNumber} onChange={(e) => update('contactNumber', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Relationship to the Patient:</label>
                <input type="text" placeholder="(e.g., Mother, Father, Sister, etc.)" required
                  value={form.relationship} onChange={(e) => update('relationship', e.target.value)} />
              </div>

              <p className="field-hint" style={{ marginBottom: 10 }}>
                Your information is used only to manage your child's records and appointments
                within KiddoCare and is not shared with third parties. See our{' '}
                <a href="#" onClick={(e) => e.preventDefault()}>Data Privacy Policy</a>.
              </p>
              <div className="terms">
                <input type="checkbox" id="agree" required
                  checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
                <label htmlFor="agree">
                  I have read and agree to the{' '}
                  <a href="#" onClick={(e) => { e.preventDefault(); setShowTerms(true) }}>Terms &amp; Conditions</a>
                  {' '}and Data Privacy Policy.
                </label>
              </div>

              <button type="submit" className="btn-primary" disabled={!agreed}>Continue →</button>
              <button type="button" className="btn-secondary" onClick={() => setStep(2)}>← Back</button>
            </form>
          </div>
        )}

        {step === 'done' && (
          <div className="auth-card auth-step active">
            <h2>You're all set</h2>
            <div className="success-box">
              <div className="success-icon">✓</div>
              <p>Account created successfully!</p>
              <button
                className="btn-primary"
                onClick={() => {
                  login({
                    guardianName: form.guardianName,
                    patientName: form.patientName,
                    dob: form.dob,
                    gender: form.gender,
                    email: form.email,
                    contactNumber: form.contactNumber,
                  })
                  navigate('/dashboard')
                }}
              >
                Log In
              </button>
            </div>
          </div>
        )}
      </div>

      {showTerms && (
        <div
          onClick={() => setShowTerms(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--white)', borderRadius: 14, padding: '32px 30px',
              maxWidth: 480, maxHeight: '70vh', overflowY: 'auto', boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            }}
          >
            <h2 style={{ color: 'var(--blue)', marginBottom: 16 }}>Terms &amp; Conditions</h2>
            <p style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 12 }}>
              By creating a KiddoCare account, you agree to provide accurate information about
              yourself and the patient in your care, and to use the platform only to manage
              legitimate pediatric appointments and records.
            </p>
            <p style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 12 }}>
              Medical data you submit is stored to support your child's care and is not sold or
              shared with third parties outside of providing the service. You may request
              deletion of your account and associated records at any time.
            </p>
            <p style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
              Appointments are subject to doctor availability and may be rescheduled by the
              clinic when necessary.
            </p>
            <button className="btn-primary" onClick={() => setShowTerms(false)}>Close</button>
          </div>
        </div>
      )}

      <Footer />
    </>
  )
}
