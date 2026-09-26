import { useState } from 'react'
import { Bell, Star, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react'
import DashboardSidebar from '../components/DashboardSidebar.jsx'

const EMOJIS = ['😞', '🙁', '😐', '🙂', '😍']
const TOPICS = ['App', 'Staff', 'Schedule', 'Documents', 'Communication', 'Billing', 'Other']

const SAMPLE_REVIEWS = [
  { id: 1, name: 'Anonymous Parent', color: '#1fa971', rating: 5, topic: 'Staff', message: 'Staff was very helpful and pleasant during our whole visit. Made the whole process stress-free.', date: 'Sept 12, 2026' },
  { id: 2, name: 'Juan Dela Cruz', color: '#e2596d', rating: 4, topic: 'Schedule', message: 'Booking an appointment was quick, though the reminder notification came in a bit late.', date: 'Sept 9, 2026' },
  { id: 3, name: 'Frank C.', color: '#3f7fe0', rating: 5, topic: 'App', message: 'Love how easy it is to track my child\u2019s vaccination records here compared to paper cards.', date: 'Sept 4, 2026' },
  { id: 4, name: 'Maria Santos', color: '#f2a1ae', rating: 5, topic: 'Communication', message: 'The nurse followed up with us personally after the checkup. Really appreciated the care.', date: 'Aug 28, 2026' },
  { id: 5, name: 'Anonymous Parent', color: '#78b1f2', rating: 4, topic: 'Billing', message: 'Payment page is straightforward, would like more receipt export options though.', date: 'Aug 20, 2026' },
]

export default function Feedback() {
  const [emojiIdx, setEmojiIdx] = useState(4)
  const [topic, setTopic] = useState('App')
  const [message, setMessage] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [childName, setChildName] = useState('')
  const [anonymous, setAnonymous] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [reviewIdx, setReviewIdx] = useState(0)

  const avgRating = (SAMPLE_REVIEWS.reduce((s, r) => s + r.rating, 0) / SAMPLE_REVIEWS.length).toFixed(1)
  const current = SAMPLE_REVIEWS[reviewIdx]

  function handleSubmit(e) {
    e.preventDefault()
    if (!message.trim() || (!anonymous && !name.trim())) return
    setSubmitted(true)
  }

  function closeModal() {
    setSubmitted(false)
    setMessage('')
    setName('')
    setEmail('')
    setChildName('')
    setAnonymous(false)
    setEmojiIdx(4)
    setTopic('App')
  }

  function nextReview() {
    setReviewIdx((i) => (i + 1) % SAMPLE_REVIEWS.length)
  }
  function prevReview() {
    setReviewIdx((i) => (i - 1 + SAMPLE_REVIEWS.length) % SAMPLE_REVIEWS.length)
  }

  return (
    <div className="dash-layout">
      <DashboardSidebar active="Feedback" />
      <main className="dash-main">
        <div className="dash-topbar">
          <h1 className="dash-title">FEEDBACK</h1>
          <div className="dash-bell">
            <Bell size={20} />
            <span className="dash-bell-dot" />
          </div>
        </div>

        <div className={`fb-grid${submitted ? ' is-blurred' : ''}`}>
          <section className="dash-panel">
            <h3><MessageCircle size={18} /> Submit Feedback</h3>
            <p className="fb-sub">We'd love to hear about your experience</p>

            <form onSubmit={handleSubmit}>
              <label className="fb-label">How was your experience? *</label>
              <div className="fb-emojis">
                {EMOJIS.map((e, i) => (
                  <button type="button" key={i}
                    className={`fb-emoji${i === emojiIdx ? ' active' : ''}`}
                    onClick={() => setEmojiIdx(i)}>{e}</button>
                ))}
              </div>

              <label className="fb-label">Topic</label>
              <div className="fb-topics">
                {TOPICS.map((t) => (
                  <button type="button" key={t}
                    className={`fb-topic${t === topic ? ' active' : ''}`}
                    onClick={() => setTopic(t)}>{t}</button>
                ))}
              </div>

              <label className="fb-label">Your Message *</label>
              <textarea className="fb-textarea" rows={3} placeholder="Tell us what could go well or what we can improve..."
                value={message} onChange={(e) => setMessage(e.target.value)} required />

              <div className="fb-row">
                <div className="fb-field">
                  <label className="fb-label">Name {!anonymous && '*'}</label>
                  <input type="text" placeholder="Your Name" value={name}
                    onChange={(e) => setName(e.target.value)} disabled={anonymous} required={!anonymous} />
                </div>
                <div className="fb-field">
                  <label className="fb-label">Email (optional)</label>
                  <input type="email" placeholder="email@example.com" value={email}
                    onChange={(e) => setEmail(e.target.value)} />
                </div>
              </div>

              <label className="fb-label">Child's Name *</label>
              <input type="text" placeholder="Kids Name" value={childName}
                onChange={(e) => setChildName(e.target.value)} required />

              <div className="fb-toggle-row">
                <label className="fb-switch">
                  <input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} />
                  <span className="fb-slider" />
                </label>
                <span>Submit Anonymously</span>
                <button type="submit" className="dash-add-btn fb-submit-btn">Submit</button>
              </div>
            </form>
          </section>

          <aside className="fb-side">
            <div className="dash-card fb-rating-card">
              <div>
                <div className="num">{avgRating}</div>
                <div className="fb-stars">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill={i < Math.round(avgRating) ? '#fff' : 'none'} />
                  ))}
                </div>
                <div className="fb-rating-sub">Based on {SAMPLE_REVIEWS.length} reviews this term</div>
              </div>
            </div>

            <div className="dash-panel fb-recent-panel">
              <h3>Recent Feedback</h3>

              <ul className="recent-list">
                {SAMPLE_REVIEWS.map((r, i) => (
                  <li key={r.id} className={`recent-item${i === reviewIdx ? ' active' : ''}`}
                    onClick={() => setReviewIdx(i)}>
                    <span className="recent-avatar" style={{ background: r.color }}>{r.name[0]}</span>
                    <span className="recent-name">{r.name}</span>
                  </li>
                ))}
              </ul>

              <div className="recent-detail">
                <div className="recent-detail-head">
                  <span className="recent-avatar" style={{ background: current.color }}>{current.name[0]}</span>
                  <div>
                    <div className="recent-name">{current.name}</div>
                    <div className="fb-stars small">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} fill={i < current.rating ? '#f2a1ae' : 'none'} color="#f2a1ae" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="recent-msg">"{current.message}"</p>
                <div className="recent-meta">{current.topic} \u00b7 {current.date}</div>
              </div>

              <div className="recent-nav">
                <button type="button" onClick={prevReview}><ChevronLeft size={16} /></button>
                <span>{reviewIdx + 1} / {SAMPLE_REVIEWS.length}</span>
                <button type="button" onClick={nextReview}><ChevronRight size={16} /></button>
              </div>
            </div>
          </aside>
        </div>

        {submitted && (
          <div className="confirm-overlay" onClick={closeModal}>
            <div className="doc-modal" onClick={(e) => e.stopPropagation()}>
              <div className="doc-modal-header">FEEDBACK</div>
              <div className="doc-modal-body">
                <div className="doc-success-icon">✓</div>
                <h3>Feedback Submitted!</h3>
                <p>The feedback is submitted successfully!</p>
                <button className="btn-primary" onClick={closeModal}>OK</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
