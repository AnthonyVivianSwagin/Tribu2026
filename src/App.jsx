import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useApp } from './context/AppContext'
import { Toast } from './components/ui'
import Auth from './pages/Auth'
import Home from './pages/Home'
import ClubPage from './pages/ClubPage'
import MyEvents from './pages/MyEvents'
import Messages from './pages/Messages'
import AdminConsole from './pages/AdminConsole'
import NotFound from './pages/NotFound'
import AdminLayout from './pages/admin/AdminLayout'
import Overview from './pages/admin/Overview'
import Members from './pages/admin/Members'
import JoinRequests from './pages/admin/JoinRequests'
import AdminEvents from './pages/admin/AdminEvents'
import Announcements from './pages/admin/Announcements'
import ClubSettings from './pages/admin/ClubSettings'
import Payouts from './pages/admin/Payouts'

function Private({ children }) {
  const { user } = useApp()
  const loc = useLocation()
  if (!user) return <Navigate to="/login" replace state={{ from: loc.pathname }} />
  return children
}

export default function App() {
  const { user } = useApp()
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])

  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to={user ? '/home' : '/signup'} replace />} />
        <Route path="/signup" element={<Auth key="signup" mode="signup" />} />
        <Route path="/login" element={<Auth key="login" mode="login" />} />
        <Route path="/home" element={<Private><Home /></Private>} />
        <Route path="/clubs/:id" element={<Private><ClubPage /></Private>} />
        <Route path="/events" element={<Private><MyEvents /></Private>} />
        <Route path="/messages" element={<Private><Messages /></Private>} />
        <Route path="/manage/:clubId" element={<Private><AdminLayout /></Private>}>
          <Route index element={<Overview />} />
          <Route path="members" element={<Members />} />
          <Route path="requests" element={<JoinRequests />} />
          <Route path="events" element={<AdminEvents />} />
          <Route path="announcements" element={<Announcements />} />
          <Route path="messages" element={<Messages embedded />} />
          <Route path="settings" element={<ClubSettings />} />
          <Route path="payouts" element={<Payouts />} />
        </Route>
        <Route path="/admin-console/*" element={<AdminConsole />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toast />
    </>
  )
}
