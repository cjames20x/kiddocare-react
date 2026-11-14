import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import '../index.css'

export default function TermsAndConditions() {
  return (
    <>
      <Navbar />
      <main style={{ background: 'var(--light)', minHeight: '100vh', paddingTop: 100 }}>
        <div style={{
          maxWidth: 780, margin: '0 auto', padding: '48px 24px 80px',
          background: 'var(--white)', borderRadius: 16,
          boxShadow: '0 4px 24px rgba(0,0,0,0.07)'
        }}>
          <h1 style={{ color: 'var(--blue)', fontSize: 32, marginBottom: 8 }}>
            Terms &amp; Conditions
          </h1>
          <p style={{ color: '#888', fontSize: 14, marginBottom: 36 }}>
            Last updated: January 1, 2025
          </p>

          <Section title="1. Acceptance of Terms">
            By creating a KiddoCare account or using this platform, you agree to be bound by
            these Terms &amp; Conditions. If you do not agree, please do not use our services.
          </Section>

          <Section title="2. Account Responsibilities">
            You agree to provide accurate, current, and complete information about yourself and
            the patient(s) in your care. You are responsible for maintaining the confidentiality
            of your account credentials and for all activity that occurs under your account.
            KiddoCare accounts may only be used to manage legitimate pediatric appointments and
            health records.
          </Section>

          <Section title="3. Medical Records &amp; Data">
            Medical data you submit — including appointment history, vaccination records,
            prescriptions, and health documents — is stored solely to support your child's care
            at this clinic. This data is&nbsp;<strong>not sold or shared</strong> with third
            parties outside of providing the requested healthcare services.
          </Section>

          <Section title="4. Appointments &amp; Scheduling">
            All appointments are subject to doctor availability and clinic operating hours.
            KiddoCare reserves the right to reschedule or cancel appointments when necessary.
            We will notify guardians of any changes as early as possible through the platform's
            notification system.
          </Section>

          <Section title="5. Privacy">
            Your use of the platform is also governed by our{' '}
            <a href="/privacy" style={{ color: 'var(--blue)' }}>Privacy Policy</a>, which is
            incorporated into these Terms by reference.
          </Section>

          <Section title="6. Children's Information">
            KiddoCare is designed for guardians to manage records on behalf of minor patients.
            By registering a child's information, you confirm that you are the parent or legal
            guardian of that child and have the authority to share their health information with
            this clinic.
          </Section>

          <Section title="7. Account Deletion">
            You may request deletion of your account and all associated records at any time by
            contacting the clinic directly at{' '}
            <a href="mailto:kiddocare02@gmail.com" style={{ color: 'var(--blue)' }}>
              kiddocare02@gmail.com
            </a>. Requests will be processed within 30 days.
          </Section>

          <Section title="8. Changes to Terms">
            We may update these Terms &amp; Conditions from time to time. Continued use of the
            platform after changes are posted constitutes your acceptance of the revised terms.
            We will indicate the "Last updated" date at the top of this page.
          </Section>

          <Section title="9. Contact Us" last>
            If you have questions about these Terms &amp; Conditions, please reach out to us:
            <ul style={{ marginTop: 10, paddingLeft: 20, lineHeight: 1.9 }}>
              <li>Email: <a href="mailto:kiddocare02@gmail.com" style={{ color: 'var(--blue)' }}>kiddocare02@gmail.com</a></li>
              <li>Phone: 0912 345 6789</li>
              <li>Address: Manila, Philippines</li>
            </ul>
          </Section>
        </div>
      </main>
      <Footer />
    </>
  )
}

function Section({ title, children, last }) {
  return (
    <section style={{ marginBottom: last ? 0 : 32 }}>
      <h2 style={{ color: 'var(--blue)', fontSize: 18, marginBottom: 10 }}>{title}</h2>
      <p style={{ fontSize: 15, lineHeight: 1.75, color: '#444' }}>{children}</p>
    </section>
  )
}
