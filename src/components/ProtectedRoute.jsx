import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const STAFF_ROLES = ['admin', 'clinic_manager', 'doctor', 'staff']

/**
 * Wrap a route element with this to require login (and optionally a
 * specific set of roles). While the app is still checking an existing
 * session (on page refresh), it renders nothing rather than redirecting
 * early and bouncing the user back to /login incorrectly.
 *
 * Usage:
 *   <ProtectedRoute><Dashboard /></ProtectedRoute>                 // any logged-in user
 *   <ProtectedRoute roles={STAFF_ROLES}><AdminDashboard /></ProtectedRoute>
 */
export default function ProtectedRoute({ children, roles }) {
  const { isLoggedIn, user, loading } = useAuth()

  if (loading) return null

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />
  }

  if (roles && !roles.includes(user.role)) {
    // Logged in, but as the wrong kind of account (e.g. a guardian hitting
    // an admin-only route) — send them to their own dashboard instead.
    const fallback = STAFF_ROLES.includes(user.role) ? '/admin-dashboard' : '/dashboard'
    return <Navigate to={fallback} replace />
  }

  return children
}

export { STAFF_ROLES }
