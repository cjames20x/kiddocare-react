import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import '../index.css'

export default function PrivacyPolicy() {
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
            Privacy Policy
          </h1>
          <p style={{ color: '#888', fontSize: 14, marginBottom: 36 }}>
            Last updated: January 1, 2025
          </p>

          <p style={{ fontSize: 15, lineHeight: 1.75, color: '#444', marginBottom: 32 }}>
            KiddoCare is committed to protecting the privacy and security of your personal and
            health information. This Privacy Policy explains what data we collect, how we use
            it, and how we keep it safe.
          </p>

          <Section title="1. Information We Collect">
            When you register and use KiddoCare, we may collect the following types of
            information:
            <ul style={{ marginTop: 10, paddingLeft: 20, lineHeight: 1.9 }}>
              <li><strong>Account information:</strong> full name, email address, password (hashed), and phone number</li>
              <li><strong>Patient information:</strong> child's name, date of birth, address, and sex</li>
              <li><strong>Health records:</strong> diagnoses, prescriptions, vaccination records, and medical documents</li>
              <li><strong>Appointment data:</strong> scheduled dates, appointment type, attending doctor, and status</li>
              <li><strong>Device &amp; usage data:</strong> browser type and general usage patterns for system improvements</li>
            </ul>
          </Section>

          <Section title="2. How We Use Your Information">
            We use the information collected to:
            <ul style={{ marginTop: 10, paddingLeft: 20, lineHeight: 1.9 }}>
              <li>Manage and schedule pediatric appointments</li>
              <li>Maintain accurate vaccination and medical records for each patient</li>
              <li>Send notifications about upcoming appointments and due vaccination dates</li>
              <li>Allow authorized clinic staff to provide appropriate healthcare services</li>
              <li>Improve the platform's features and user experience</li>
            </ul>
          </Section>

          <Section title="3. Data Sharing">
            Your information is <strong>not sold, rented, or shared</strong> with third parties
            for marketing or commercial purposes. Data may only be accessed by:
            <ul style={{ marginTop: 10, paddingLeft: 20, lineHeight: 1.9 }}>
              <li>Authorized clinic staff (doctors, nurses, and administrators) for the purpose of providing care</li>
              <li>Service providers who operate the platform infrastructure under strict confidentiality agreements</li>
              <li>Legal authorities, only if required by applicable Philippine law</li>
            </ul>
          </Section>

          <Section title="4. Data Security">
            KiddoCare uses industry-standard measures to protect your data:
            <ul style={{ marginTop: 10, paddingLeft: 20, lineHeight: 1.9 }}>
              <li>Data is stored on Supabase, which provides encrypted databases and secure API access</li>
              <li>Passwords are stored using bcrypt hashing — never in plain text</li>
              <li>Role-based access control ensures staff can only access the data needed for their role</li>
              <li>Multi-factor authentication (MFA) is available for additional account security</li>
            </ul>
          </Section>

          <Section title="5. Children's Privacy">
            KiddoCare is a platform for <em>guardians</em> to manage records on behalf of minor
            children. We do not knowingly collect personal information directly from children
            under 13. By registering a child's information, you confirm you are the parent or
            legal guardian of that child and consent to the collection and use of their health
            information as described in this policy.
          </Section>

          <Section title="6. Data Retention">
            We retain your account and patient records for as long as your account is active or
            as needed to provide services. If you request account deletion, we will remove your
            personal data and associated records within 30 days, except where retention is
            required by law.
          </Section>

          <Section title="7. Your Rights">
            As a user of KiddoCare, you have the right to:
            <ul style={{ marginTop: 10, paddingLeft: 20, lineHeight: 1.9 }}>
              <li><strong>Access:</strong> request a copy of the personal data we hold about you</li>
              <li><strong>Correction:</strong> update inaccurate or incomplete information through your account</li>
              <li><strong>Deletion:</strong> request that your account and all associated records be permanently deleted</li>
              <li><strong>Objection:</strong> object to certain processing of your data by contacting us directly</li>
            </ul>
          </Section>

          <Section title="8. Changes to This Policy">
            We may update this Privacy Policy from time to time to reflect changes in our
            practices or for legal, operational, or regulatory reasons. We will update the
            "Last updated" date at the top and, where appropriate, notify you through the
            platform.
          </Section>

          <Section title="9. Contact Us" last>
            If you have questions, concerns, or requests regarding this Privacy Policy, please
            contact us at:
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
      <div style={{ fontSize: 15, lineHeight: 1.75, color: '#444' }}>{children}</div>
    </section>
  )
}
