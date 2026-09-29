import { createContext, useContext, useState } from 'react'
import { CalendarDays, CreditCard, Edit3, Syringe } from 'lucide-react'

const INITIAL_NOTIFICATIONS = [
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
    description: "Your payment of $85.00 for Liam's clinic visit has been received and applied to your account.",
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
    unread: true,
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
    unread: true,
  },
]

const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS)
  const [isOpen, setIsOpen] = useState(false)
  const unreadCount = notifications.filter((notification) => notification.unread).length

  return (
    <NotificationContext.Provider value={{
      notifications,
      setNotifications,
      isOpen,
      setIsOpen,
      unreadCount,
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