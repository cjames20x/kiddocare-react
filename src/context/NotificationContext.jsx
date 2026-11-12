import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { CalendarDays, CreditCard, Edit3, Syringe, Bell } from 'lucide-react'
import { useAuth } from './AuthContext.jsx'

const NotificationContext = createContext(null)

export function getNotificationIcon(type) {
  switch (type) {
    case 'Visits': return CalendarDays
    case 'Vaccines': return Syringe
    case 'Bills': return CreditCard
    default: return Bell
  }
}

export function NotificationProvider({ children }) {
  let authUser = null
  let isStaff = false
  try {
    const auth = useAuth()
    authUser = auth?.user
    isStaff = Boolean(auth?.isStaff)
  } catch (e) {
    // In case provider rendered outside AuthContext
  }

  // Isolated per-user storage key (ensures notifications are never centralized)
  const userKey = useMemo(() => {
    if (!authUser) return isStaff ? 'admin_staff' : 'user_guest'
    const id = authUser.id || authUser.user_id || authUser.username || authUser.email || 'guest'
    return `${isStaff ? 'admin' : 'guardian'}_${id}`
  }, [authUser, isStaff])

  const storageKey = `kiddocare_notifs_${userKey}`

  // Initial template when a user has no stored notifications yet
  const getDefaultNotifications = useCallback(() => {
    if (isStaff) {
      return [
        {
          id: Date.now(),
          key: 'clinic-welcome',
          type: 'Visits',
          title: 'Clinic Admin Connected',
          child: 'Staff Operations',
          description: 'Staff portal connected to Supabase live database. Operational events will appear here.',
          time: 'Just now',
          tone: 'blue',
          unread: false,
        }
      ]
    }
    return [
      {
        id: Date.now(),
        key: 'guardian-welcome',
        type: 'Visits',
        title: 'Welcome to KiddoCare',
        child: authUser?.guardianName || authUser?.username || 'Guardian',
        description: 'Your account is ready. Track your registered children, clinic checkups, and vaccinations here.',
        time: 'Just now',
        tone: 'blue',
        unread: true,
      }
    ]
  }, [authUser, isStaff])

  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch (e) {
      console.warn('Could not read user notifications:', e)
    }
    return getDefaultNotifications()
  })

  // Whenever logged-in account changes, load that specific user's notifications
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setNotifications(parsed)
          return
        }
      }
    } catch (e) {}
    setNotifications(getDefaultNotifications())
  }, [storageKey, getDefaultNotifications])

  // Save changes isolated to this specific user's localStorage
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(notifications))
    } catch (e) {
      console.warn('Could not persist user notifications:', e)
    }
  }, [notifications, storageKey])

  const [isOpen, setIsOpen] = useState(false)
  const unreadCount = notifications.filter((n) => n.unread).length

  // Add a new live notification for this account
  const addNotification = useCallback((notif) => {
    setNotifications((prev) => [
      {
        id: Date.now() + Math.floor(Math.random() * 1000),
        unread: true,
        time: 'Just now',
        tone: notif.tone || (notif.type === 'Visits' ? 'blue' : notif.type === 'Vaccines' ? 'mint' : 'gold'),
        ...notif,
      },
      ...prev,
    ])
  }, [])

  // Sync real-time updates for guardian's own children without duplicating
  const syncUserUpdates = useCallback(({ children = [], appointments = [], vaccinations = [] }) => {
    setNotifications((prev) => {
      const existingKeys = new Set(prev.map((n) => n.key).filter(Boolean))
      const newItems = []

      // 1. Appointments for this guardian's children
      appointments.forEach((a) => {
        const key = `user-appt-${a.id}-${a.status || 'Confirmed'}`
        if (!existingKeys.has(key)) {
          const childName = a.childName || a.patient_name || 'Child'
          newItems.push({
            id: Date.now() + Math.floor(Math.random() * 1000),
            key,
            type: 'Visits',
            title: `Appointment ${a.status || 'Confirmed'}`,
            child: childName,
            description: `Appointment for ${childName} on ${a.date || a.appointment_date} at ${a.time || a.appointment_time} is ${a.status || 'Confirmed'}.`,
            time: 'Latest status',
            tone: a.status === 'Cancelled' ? 'rose' : a.status === 'Completed' ? 'mint' : 'blue',
            unread: true,
          })
          existingKeys.add(key)
        }
      })

      // 2. Upcoming vaccine due dates for this guardian's children
      vaccinations.forEach((v) => {
        if (v.next_due_date && v.next_due_date !== '—') {
          const key = `user-vax-due-${v.id || v.vaccination_id}-${v.next_due_date}`
          if (!existingKeys.has(key)) {
            const childName = v.patient_name || 'Child'
            newItems.push({
              id: Date.now() + Math.floor(Math.random() * 1000),
              key,
              type: 'Vaccines',
              title: 'Vaccination Due Soon',
              child: childName,
              description: `${childName} is scheduled for their next dose of ${v.vaccine_name || 'Vaccine'} on ${v.next_due_date}.`,
              time: 'Follow-up due',
              tone: 'mint',
              unread: true,
            })
            existingKeys.add(key)
          }
        }
      })

      if (newItems.length === 0) return prev
      return [...newItems, ...prev]
    })
  }, [])

  // Sync real-time updates for clinic admin operations
  const syncAdminUpdates = useCallback(({ appointments = [], vaccinations = [] }) => {
    setNotifications((prev) => {
      const existingKeys = new Set(prev.map((n) => n.key).filter(Boolean))
      const newItems = []

      // Pending appointments needing admin attention
      appointments.filter(a => a.status === 'Pending').forEach((a) => {
        const key = `admin-pending-${a.id}`
        if (!existingKeys.has(key)) {
          newItems.push({
            id: Date.now() + Math.floor(Math.random() * 1000),
            key,
            type: 'Visits',
            title: 'New Appointment Booking',
            child: a.patient_name || `Patient #${a.patient_id}`,
            description: `New visit booked for ${a.appointment_date} at ${a.appointment_time}. Awaiting clinic confirmation.`,
            time: 'Pending review',
            tone: 'blue',
            unread: true,
          })
          existingKeys.add(key)
        }
      })

      if (newItems.length === 0) return prev
      return [...newItems, ...prev]
    })
  }, [])

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
      syncUserUpdates,
      syncAdminUpdates,
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
