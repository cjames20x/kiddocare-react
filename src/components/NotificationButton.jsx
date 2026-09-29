import { Bell } from 'lucide-react'
import { useNotifications } from '../context/NotificationContext.jsx'

export default function NotificationButton() {
  const { setIsOpen, unreadCount } = useNotifications()

  return (
    <button
      type="button"
      className="dash-bell"
      onClick={() => setIsOpen(true)}
      aria-label={`Open notifications, ${unreadCount} unread`}
      aria-haspopup="dialog"
      title="Notifications"
    >
      <Bell size={20} aria-hidden="true" />
      {unreadCount > 0 && <span className="dash-bell-dot" aria-hidden="true" />}
    </button>
  )
}