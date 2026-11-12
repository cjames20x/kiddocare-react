import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Services from './pages/Services.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Documents from './pages/Documents.jsx'
import Feedback from './pages/Feedback.jsx'
import Help from './pages/Help.jsx'
import Vaccinations from './pages/Vaccinations.jsx'
import Payments from './pages/Payments.jsx'
import UserDashboard from './pages/UserDashboard.jsx'
import AdminLogin from './pages/AdminLogin.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import ProtectedRoute, { STAFF_ROLES } from './components/ProtectedRoute.jsx'
import NotificationBar from './components/NotificationBar.jsx'

export default function App() {
  return (
    <>
      <NotificationBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin" element={<AdminLogin />} />

        {/* Guardian-only routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
        <Route path="/feedback" element={<ProtectedRoute><Feedback /></ProtectedRoute>} />
        <Route path="/help" element={<ProtectedRoute><Help /></ProtectedRoute>} />
        <Route path="/vaccinations" element={<ProtectedRoute><Vaccinations /></ProtectedRoute>} />
        <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
        <Route path="/user-dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />

        {/* Staff-only route */}
        <Route
          path="/admin-dashboard"
          element={<ProtectedRoute roles={STAFF_ROLES}><AdminDashboard /></ProtectedRoute>}
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
