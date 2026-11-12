import { createContext, useContext, useState, useEffect } from 'react'
import { CalendarDays, CreditCard, Edit3, Syringe, Bell } from 'lucide-react'
import { useAuth } from './AuthContext.jsx'

const GUARDIAN_NOTIFICATIONS = [
  {
    id: 1,
    type: 'Visits',
    title: 'Routine Growth Checkup',
    child: 'Sophia',
    description: 'Sophia has a routine growth checkup scheduled with Dr. Reyes tomorrow at 9:30 AM.',
    time: '15 minutes ago',
    icon: CalendarDays,
    tone: 'blue',
    unread: true,
  },
  {
    id: 2,
    type: 'Visits',
    title: 'Missed Clinic Visit Reminder',
    child: 'Liam',
    description: 'Liam missed his wellness visit. Please choose a new appointment time when convenient.',
    time: '1 hour ago',
    icon: Edit3,
    tone: 'rose',
    unread: true,
  },
  {
    id: 3,
    type: 'Vaccines',
    title: 'Vaccination Due Soon',
    child: 'Sophia',
    description: "Sophia's seasonal flu vaccine is due in 7 days. Book a visit to keep her records current.",
    time: '3 hours ago',
    icon: Syringe,
    tone: 'mint',
    unread: true,
  },
  {
    id: 4,
    type: 'Bills',
    title: 'Payment Received Successfully',
    child: 'Liam',
    description: "Your payment of ₱1,200 for Liam's clinic visit has been received and applied to your account.",
    time: 'Yesterday',
    icon: CreditCard,
    tone: 'gold',
    unread: true,
  },
  {
    id: 5,
    type: 'Vaccines',
    title: 'Immunization Record Updated',
    child: 'Sophia',
    description: "Sophia's immunization record was updated after her appointment with Dr. Reyes.",
    time: 'Yesterday',
    icon: Syringe,
    tone: 'mint',
    unread: false,
  },
  {
    id: 6,
    type: 'Bills',
    title: 'Balance Statement Ready',
    child: 'Liam',
    description: 'Your latest KiddoCare balance statement is ready to review in your account.',
    time: '2 days ago',
    icon: CreditCard,
    tone: 'gold',
    unread: false,
  },
]

const STAFF_NOTIFICATIONS = [
  {
    id: 101,
    type: 'Visits',
    title: 'New Appointment Scheduled',
    child: 'Lhea Santos',
    description: 'Guardian Emma Santos scheduled a pediatric checkup with Dra. Maury V. Reyes.',
    time: '10 minutes ago',
    icon: CalendarDays,
    tone: 'blue',
    unread: true,
  },
  {
    id: 102,
    type: 'Visits',
    title: 'Appointment Cancelled',
    child: 'Johny Tan',
    description: 'Guardian Felicia Tan requested cancellation for the Aug 20 consultation.',
    time: '40 minutes ago',
    icon: Edit3,
    tone: 'rose',
    unread: true,
  },
  {
    id: 103,
    type: 'Vaccines',
    title: 'Vaccine Inventory Alert',
    child: 'Clinic Supply',
    description: 'Infanrix Hexa stock has dropped below minimum threshold (12 doses remaining).',
    time: '2 hours ago',
    icon: Syringe,
    tone: 'mint',
    unread: true,
  },
  {
    id: 104,
    type: 'Bills',
    title: 'Payment Confirmed',
    child: 'Kyla Mae Yap',
    description: 'Received ₱1,500 consultation payment via GCash. Invoice #KC-INV-204 verified.',
    time: '3 hours ago',
    icon: CreditCard,
    tone: 'gold',
    unread: true,
  },
  {
    id: 105,
    type: 'Visits',
    title: 'Patient Intake Completed',
    child: 'Sofia Andrade',
    description: 'Guardian Justine Andrade completed registration and updated clinic records.',
    time: 'Yesterday',
    icon: CalendarDays,
    tone: 'blue',
    unread: false,
  },
]

const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  let isStaff = false
  try {
    const auth = useAuth()
    isStaff = Boolean(auth?.isStaff)
  } catch (e) {
    // In case provider used outside AuthContext
  }

  const [notifications, setNotifications] = useState(() => (isStaff ? STAFF_NOTIFICATIONS : GUARDIAN_NOTIFICATIONS))
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setNotifications(isStaff ? STAFF_NOTIFICATIONS : GUARDIAN_NOTIFICATIONS)
  }, [isStaff])

  const unreadCount = notifications.filter((notification) => notification.unread).length

  const addNotification = (notif) => {
    setNotifications((prev) => [
      {
        id: Date.now(),
        unread: true,
        time: 'Just now',
        icon: notif.icon || (notif.type === 'Visits' ? CalendarDays : notif.type === 'Vaccines' ? Syringe : notif.type === 'Bills' ? CreditCard : Bell),
        tone: notif.tone || (notif.type === 'Visits' ? 'blue' : notif.type === 'Vaccines' ? 'mint' : 'gold'),
        ...notif,
      },
      ...prev,
    ])
  }

  const markAsRead = (id) => {
    setNotifications((current) => current.map((n) => (n.id === id ? { ...n, unread: false } : n)))
  }

  const markAllAsRead = () => {
    setNotifications((current) => current.map((n) => ({ ...n, unread: false })))
  }

  const removeNotification = (id) => {
    setNotifications((current) => current.filter((n) => n.id !== id))
  }

  return (
    <NotificationContext.Provider value={{
      notifications,
      setNotifications,
      isOpen,
      setIsOpen,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      removeNotification,
    }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) throw new Error('useNotifications must be used within NotificationProvider')
  return context
}
