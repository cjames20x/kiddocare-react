import { useEffect, useState } from 'react'
import { Star, MessageCircle } from 'lucide-react'
import DashboardSidebar from '../components/DashboardSidebar.jsx'
import NotificationButton from '../components/NotificationButton.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { listFeedback, submitFeedback } from '../lib/api.js'

const EMOJIS = ['😞', '🙁', '😐', '🙂', '😍']
const TOPICS = ['App', 'Staff', 'Schedule', 'Documents', 'Communication', 'Billing', 'Other']
const AVATAR_COLORS = ['#1fa971', '#3f7fe0', '#e2596d', '#f2a1ae', '#78b1f2']

function avatarColor(name) {
  let hash = 0
  for (const ch of name) hash = (hash + ch.charCodeAt(0)) % AVATAR_COLORS.length
  return AVATAR_COLORS[hash]
}

function formatDate(iso) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function toReview(row) {
  const name = row.display_name || 'Anonymous Parent'
  return {
    id: row.feedback_id,
    name,
    color: avatarColor(name),
    rating: row.rating,
    topic: row.topic,
    message: row.message,
    date: formatDate(row.created_at),
  }
}

export default function Feedback() {
  const { user, accessToken } = useAuth()
  const [emojiIdx, setEmojiIdx] = useState(4)
  const [topic, setTopic] = useState('App')
  const [message, setMessage] = useState('')
  const [name, setName] = useState(user?.guardianName || '')
  const [anonymous, setAnonymous] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [filterTopic, setFilterTopic] = useState('App')
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  async function loadReviews() {
    if (!accessToken) return
    setLoading(true)
    setLoadError('')
    try {
      const data = await listFeedback(accessToken)
      setReviews((data.feedback || []).map(toReview))
    } catch (err) {
      setLoadError(err.message || 'Could not load feedback.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReviews()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken])

  const avgRating = reviews.length
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : null
  const filteredReviews = reviews.filter((review) => review.topic === filterTopic)
  const canSubmit = Boolean(message.trim()) && (anonymous || Boolean(name.trim())) && !submitting

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitError('')
    if (!message.trim() || (!anonymous && !name.trim())) return

    setSubmitting(true)
    try {
      await submitFeedback(
        {
          rating: emojiIdx + 1,
          topic,
          message: message.trim(),
          is_anonymous: anonymous,
          display_name: anonymous ? undefined : name.trim(),
        },
        accessToken
      )
      setFilterTopic(topic)
      setSubmitted(true)
      await loadReviews()
    } catch (err) {
      setSubmitError(err.message || 'Could not submit feedback. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  function closeModal() {
    setSubmitted(false)
    setMessage('')
    setName(user?.guardianName || '')
    setAnonymous(false)
    setEmojiIdx(4)
    setTopic('App')
    setSubmitError('')
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
        .fb-recent-error { font-size: 12.5px; color: #b3412c; font-style: normal; padding: 10px 2px; }
        .fb-review-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 14px; margin-bottom: 8px; }
        .fb-review-card:last-child { margin-bottom: 0; }
      `}</style>

      <DashboardSidebar active="Feedback" />
      <main className="dash-main">
        <div className="dash-topbar">
          <h1 className="dash-title">FEEDBACK</h1>
          <NotificationButton />
        </div>

        <div className={`fb-grid${submitted ? ' is-blurred' : ''}`}>
          <section className="dash-panel">
            <h3><MessageCircle size={18} /> Submit Feedback</h3>
            <p className="fb-sub">We'd love to hear about your experience</p>
            {submitError && <p className="auth-error">{submitError}</p>}

            <form onSubmit={handleSubmit}>
              <label className="fb-label">How was your experience? *</label>
              <div className="fb-emojis">
                {EMOJIS.map((emoji, i) => (
                  <button type="button" key={i}
                    className={`fb-emoji${i === emojiIdx ? ' active' : ''}`}
                    onClick={() => setEmojiIdx(i)}>{emoji}</button>
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
                <button
                  type="submit"
                  className={`dash-add-btn fb-submit-btn${canSubmit ? ' is-ready' : ''}`}
                  disabled={!canSubmit}
                >
                  {submitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>
          </section>

          <aside className="fb-side">
            <div className="dash-card fb-rating-card">
              <div>
                <div className="num">{avgRating ?? '—'}</div>
                <div className="fb-stars">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill={i < Math.round(Number(avgRating) || 0) ? '#fff' : 'none'} />
                  ))}
                </div>
                <div className="fb-rating-sub">
                  {loading
                    ? 'Loading reviews…'
                    : `Based on ${reviews.length} review${reviews.length === 1 ? '' : 's'}`}
                </div>
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
                {loading ? (
                  <p className="fb-recent-empty">Loading feedback…</p>
                ) : loadError ? (
                  <p className="fb-recent-error">{loadError}</p>
                ) : filteredReviews.length === 0 ? (
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
