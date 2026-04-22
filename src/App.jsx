import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import LandingPage from './pages/LandingPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import SignupPage from './pages/SignupPage.jsx'
import LiveDemoPage from './pages/demo/LiveDemoPage.jsx'
import UploadPage from './pages/upload/UploadPage.jsx'
import BenchmarkPage from './pages/benchmark/BenchmarkPage.jsx'
import UserDashboardPage from './pages/dashboard/UserDashboardPage.jsx'
import AdminDashboardPage from './pages/admin/AdminDashboardPage.jsx'
import AppShell from './components/layout/AppShell.jsx'

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, token } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  if (adminOnly && user?.role !== 'admin') return <Navigate to="/app/dashboard" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/app" element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/app/demo" replace />} />
          <Route path="demo" element={<LiveDemoPage />} />
          <Route path="upload" element={<UploadPage />} />
          <Route path="benchmark" element={<BenchmarkPage />} />
          <Route path="dashboard" element={<UserDashboardPage />} />
          <Route path="admin" element={
            <ProtectedRoute adminOnly>
              <AdminDashboardPage />
            </ProtectedRoute>
          } />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
