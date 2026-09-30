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

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/services" element={<Services />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/documents" element={<Documents />} />
      <Route path="/feedback" element={<Feedback />} />
      <Route path="/help" element={<Help />} />
      <Route path="/vaccinations" element={<Vaccinations />} />
      <Route path="/payments" element={<Payments />} />
      <Route path="/user-dashboard" element={<UserDashboard />} />
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}