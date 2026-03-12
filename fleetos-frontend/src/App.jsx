import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import AppLayout from './components/layout/AppLayout'

// Auth pages
import LoginPage        from './pages/auth/LoginPage'
import RegisterPage     from './pages/auth/RegisterPage'
import ForgotPassword   from './pages/auth/ForgotPasswordPage'

// App pages
import DashboardPage    from './pages/DashboardPage'
import VehiclesPage     from './pages/vehicles/VehiclesPage'
import VehicleDetail    from './pages/vehicles/VehicleDetailPage'
import TripsPage        from './pages/trips/TripsPage'
import UsersPage        from './pages/users/UsersPage'
import ReportsPage      from './pages/ReportsPage'
import QrScanPage       from './pages/QrScanPage'
import ProfilePage      from './pages/ProfilePage'

function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, isAdmin } = useAuthStore()
  if (!isAuthenticated()) return <Navigate to="/login" replace />
  if (adminOnly && !isAdmin()) return <Navigate to="/dashboard" replace />
  return children
}

function GuestRoute({ children }) {
  const { isAuthenticated } = useAuthStore()
  if (isAuthenticated()) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Guest routes */}
        <Route path="/login"           element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/register"        element={<GuestRoute><RegisterPage /></GuestRoute>} />
        <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />

        {/* Protected app routes */}
        <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"    element={<DashboardPage />} />
          <Route path="vehicles"     element={<VehiclesPage />} />
          <Route path="vehicles/:id" element={<VehicleDetail />} />
          <Route path="trips"        element={<TripsPage />} />
          <Route path="users"        element={<ProtectedRoute adminOnly><UsersPage /></ProtectedRoute>} />
          <Route path="reports"      element={<ProtectedRoute adminOnly><ReportsPage /></ProtectedRoute>} />
          <Route path="qr-scan"      element={<QrScanPage />} />
          <Route path="profile"      element={<ProfilePage />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
