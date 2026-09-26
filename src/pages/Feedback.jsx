import { useState } from 'react'
import { Bell, Star, MessageCircle } from 'lucide-react'
import DashboardSidebar from '../components/DashboardSidebar.jsx'

const EMOJIS = ['😞', '🙁', '😐', '🙂', '😍']
const TOPICS = ['App', 'Staff', 'Schedule', 'Documents', 'Communication', 'Billing', 'Other']

const SAMPLE_REVIEWS = [
  { id: 1, name: 'Anonymous Parent', color: '#1fa971', rating: 5, topic: 'Staff', message: 'Staff was very helpful and pleasant during our whole visit. Made the whole process stress-free.', date: 'Sept 12, 2026' },
  { id: 2, name: 'Mark Villanueva', color: '#3f7fe0', rating: 5, topic: 'Staff', message: 'Every staff member we\u2019ve met has been warm and patient with our toddler. Truly makes a difference.', date: 'Sept 2, 2026' },
  { id: 3, name: 'Juan Dela Cruz', color: '#e2596d', rating: 4, topic: 'Schedule', message: 'Booking an appointment was quick, though the reminder notification came in a bit late.', date: 'Sept 9, 2026' },
  { id: 4, name: 'Anonymous Parent', color: '#1fa971', rating: 5, topic: 'Schedule', message: 'Rescheduling an appointment took less than a minute. Loved how flexible the time slots are.', date: 'Aug 30, 2026' },
  { id: 5, name: 'Frank C.', color: '#3f7fe0', rating: 5, topic: 'App', message: 'Love how easy it is to track my child\u2019s vaccination records here compared to paper cards.', date: 'Sept 4, 2026' },
  { id: 6, name: 'Liza Cruz', color: '#f2a1ae', rating: 4, topic: 'App', message: 'The app is intuitive overall, though it sometimes lags when uploading photos for the child profile.', date: 'Sept 18, 2026' },
  { id: 7, name: 'Ella Ramos', color: '#78b1f2', rating: 4, topic: 'Documents', message: 'Downloading the immunization form was easy, but I wish I could fill it out directly in the app.', date: 'Sept 6, 2026' },
  { id: 8, name: 'Anonymous Parent', color: '#e2596d', rating: 5, topic: 'Documents', message: 'Having all our medical forms in one place saved us so much time during enrollment.', date: 'Aug 22, 2026' },
  { id: 9, name: 'Maria Santos', color: '#f2a1ae', rating: 5, topic: 'Communication', message: 'The nurse followed up with us personally after the checkup. Really appreciated the care.', date: 'Aug 28, 2026' },
  { id: 10, name: 'Tomas Reyes', color: '#3f7fe0', rating: 4, topic: 'Communication', message: 'Notifications are helpful, though a couple of reminders arrived after the visit had already happened.', date: 'Sept 1, 2026' },
  { id: 11, name: 'Anonymous Parent', color: '#78b1f2', rating: 4, topic: 'Billing', message: 'Payment page is straightforward, would like more receipt export options though.', date: 'Aug 20, 2026' },
  { id: 12, name: 'Grace Lim', color: '#3f7fe0', rating: 5, topic: 'Billing', message: 'Payment confirmation was instant and the receipt was emailed right away. Very convenient.', date: 'Sept 10, 2026' },
  { id: 13, name: 'Anonymous Parent', color: '#1fa971', rating: 4, topic: 'Other', message: 'Would love a dark mode option for the app, but overall a great experience so far.', date: 'Aug 25, 2026' },
  { id: 14, name: 'Carlo Santos', color: '#78b1f2', rating: 5, topic: 'Other', message: 'Just wanted to say thank you to the whole KiddoCare team for making parenting a little easier.', date: 'Aug 15, 2026' },
]

export default function Feedback() {
  const [emojiIdx, setEmojiIdx] = useState(4)
  const [topic, setTopic] = useState('App')
  const [message, setMessage] = useState('')
  const [name, setName] = useState('')
  const [anonymous, setAnonymous] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [filterTopic, setFilterTopic] = useState('App')

  const avgRating = (SAMPLE_REVIEWS.reduce((s, r) => s + r.rating, 0) / SAMPLE_REVIEWS.length).toFixed(1)
  const filteredReviews = SAMPLE_REVIEWS.filter((r) => r.topic === filterTopic)

  function handleSubmit(e) {
    e.preventDefault()
    if (!message.trim() || (!anonymous && !name.trim())) return
    setSubmitted(true)
  }

  function closeModal() {
    setSubmitted(false)
    setMessage('')
    setName('')
    setAnonymous(false)
    setEmojiIdx(4)
    setTopic('App')
  }

  return (
    <div className="dash-layout">
      <style>{`
        .fb-textarea-sized { height: 160px !important; min-height: 0 !important; resize: vertical; }
        .fb-recent-scroll { max-height: 420px; overflow-y: auto; padding-right: 6px; margin-top: 2px; }
        .fb-recent-scroll::-webkit-scrollbar { width: 6px; }
        .fb-recent-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .fb-topics--filter { margin-top: 10px; margin-bottom: 14px; }
        .fb-recent-empty { font-size: 12.5px; color: #94a3b8; font-style: italic; padding: 10px 2px; }
        .fb-review-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 14px; margin-bottom: 8px; }
        .fb-review-card:last-child { margin-bottom: 0; }
      `}</style>

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
              <textarea className="fb-textarea fb-textarea-sized" rows={5} placeholder="Tell us what could go well or what we can improve..."
                value={message} onChange={(e) => setMessage(e.target.value)} required />

              <label className="fb-label">Name {!anonymous && '*'}</label>
              <input type="text" placeholder="Your Name" value={name}
                onChange={(e) => setName(e.target.value)} disabled={anonymous} required={!anonymous} />

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

              <div className="fb-topics fb-topics--filter">
                {TOPICS.map((t) => (
                  <button type="button" key={t}
                    className={`fb-topic${t === filterTopic ? ' active' : ''}`}
                    onClick={() => setFilterTopic(t)}>{t}</button>
                ))}
              </div>

              <div className="fb-recent-scroll">
                {filteredReviews.length === 0 ? (
                  <p className="fb-recent-empty">No feedback yet for {filterTopic}.</p>
                ) : (
                  filteredReviews.map((r) => (
                    <div className="fb-review-card" key={r.id}>
                      <div className="recent-detail-head">
                        <span className="recent-avatar" style={{ background: r.color }}>{r.name[0]}</span>
                        <div>
                          <div className="recent-name">{r.name}</div>
                          <div className="fb-stars small">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={12} fill={i < r.rating ? '#f2a1ae' : 'none'} color="#f2a1ae" />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="recent-msg">"{r.message}"</p>
                      <div className="recent-meta">{r.date}</div>
                    </div>
                  ))
                )}
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