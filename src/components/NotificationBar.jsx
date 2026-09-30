import { useEffect, useMemo, useState } from 'react'
import {
  Bell,
  Check,
  CheckCheck,
  Clock3,
  Search,
  Trash2,
  X,
} from 'lucide-react'
import { useNotifications } from '../context/NotificationContext.jsx'
import './NotificationBar.css'

const PRIMARY_TABS = ['Unread', 'All']
const FILTERS = ['All', 'Visits', 'Vaccines', 'Bills']

export default function NotificationBar() {
  const { isOpen, setIsOpen, notifications, setNotifications, unreadCount } = useNotifications()
  const [activeTab, setActiveTab] = useState('Unread')
  const [activeFilter, setActiveFilter] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (!isOpen) return undefined

    function handleKeyDown(event) {
      if (event.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('keydown', handleKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen, setIsOpen])

  const visibleNotifications = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return notifications.filter((notification) => {
      const matchesTab = activeTab === 'All' || notification.unread
      const matchesFilter = activeFilter === 'All' || notification.type === activeFilter
      const matchesSearch = !normalizedSearch
        || [notification.title, notification.child, notification.description, notification.type]
          .some((value) => value.toLowerCase().includes(normalizedSearch))

      return matchesTab && matchesFilter && matchesSearch
    })
  }, [activeFilter, activeTab, notifications, searchTerm])

  function markAsRead(id) {
    setNotifications((current) => current.map((notification) => (
      notification.id === id ? { ...notification, unread: false } : notification
    )))
  }

  function markAllAsRead() {
    setNotifications((current) => current.map((notification) => ({ ...notification, unread: false })))
  }

  function removeNotification(id) {
    setNotifications((current) => current.filter((notification) => notification.id !== id))
  }

  if (!isOpen) return null

  return (
    <div
      className="notification-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) setIsOpen(false)
      }}
    >
      <aside className="notification-panel" role="dialog" aria-modal="true" aria-labelledby="notification-title">
        <div className="notification-header">
          <div className="notification-heading">
            <span className="notification-heading-icon"><Bell size={20} strokeWidth={2.4} /></span>
            <div>
              <h2 id="notification-title">Notifications</h2>
              <span className="notification-count">{unreadCount} unread updates</span>
            </div>
          </div>
          <button type="button" className="notification-icon-button" onClick={() => setIsOpen(false)} aria-label="Close notifications" title="Close">
            <X size={21} />
          </button>
        </div>

        <div className="notification-content">
          <label className="notification-search">
            <Search size={17} aria-hidden="true" />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search vaccine, appointment, tip, or bill..."
              aria-label="Search notifications"
            />
          </label>

          <div className="notification-tabs" role="tablist" aria-label="Notification status">
            {PRIMARY_TABS.map((tab) => (
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === tab}
                className={activeTab === tab ? 'notification-tab active' : 'notification-tab'}
                onClick={() => setActiveTab(tab)}
                key={tab}
              >
                {tab === 'Unread' ? `Unread (${unreadCount})` : tab}
              </button>
            ))}
          </div>

          <div className="notification-filters" aria-label="Notification categories">
            {FILTERS.map((filter) => (
              <button
                type="button"
                className={activeFilter === filter ? 'notification-filter active' : 'notification-filter'}
                onClick={() => setActiveFilter(filter)}
                key={filter}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="notification-status-bar">
            <span>You have {unreadCount} pending updates</span>
            <button type="button" onClick={markAllAsRead} disabled={unreadCount === 0}>
              <CheckCheck size={15} /> Mark all as read
            </button>
          </div>

          <div className="notification-list">
            {visibleNotifications.length > 0 ? visibleNotifications.map((notification) => {
              const Icon = notification.icon

              return (
                <article className={notification.unread ? 'notification-card unread' : 'notification-card'} key={notification.id}>
                  <div className="notification-card-header">
                    <span className={`notification-type-icon ${notification.tone}`}><Icon size={18} /></span>
                    <h3>{notification.title}</h3>
                    <span className={`notification-child-tag ${notification.tone}`}>{notification.child}</span>
                  </div>
                  <p>{notification.description}</p>
                  <div className="notification-card-footer">
                    <span className="notification-time"><Clock3 size={14} /> {notification.time}</span>
                    <div className="notification-card-actions">
                      <button type="button" onClick={() => markAsRead(notification.id)} disabled={!notification.unread} aria-label={`Mark ${notification.title} as read`} title="Mark as read">
                        <Check size={16} />
                      </button>
                      <button type="button" onClick={() => removeNotification(notification.id)} aria-label={`Delete ${notification.title}`} title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </article>
              )
            }) : (
              <div className="notification-empty">
                <Bell size={24} />
                <strong>No notifications found</strong>
                <span>Try another search or filter.</span>
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  )
}