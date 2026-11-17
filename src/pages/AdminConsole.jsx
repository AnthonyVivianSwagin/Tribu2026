/**
 * AdminConsole.jsx — Platform Administration Console
 *
 * ACADEMIC SECURITY NOTE:
 * This admin section uses front-end-only authentication (sessionStorage).
 * This is NOT equivalent to production server-side security. A determined user
 * can bypass it using browser developer tools. In production, all admin routes
 * must be protected server-side with proper role-based access control.
 * This implementation is intentionally simplified for academic demonstration.
 */

import { useState } from 'react'
import { Navigate, NavLink, Outlet, Routes, Route, useNavigate, Link } from 'react-router-dom'
import { Shield, Lock, Mail, Eye, EyeOff, LogOut, LayoutDashboard, Users, Building2, UserPlus, Calendar, Activity, Menu, X, AlertTriangle } from 'lucide-react'
import { Background, Logo, Avatar } from '../components/ui'
import { adminLogin, adminLogout, isAdminAuthed, getAllUsers, getActivityLog } from '../api/mockApi'
import { useApp } from '../context/AppContext'
import AdminDashboard from './admin-console/AdminDashboard'
import AdminUserManagement from './admin-console/AdminUserManagement'
import AdminClubManagement from './admin-console/AdminClubManagement'
import AdminMembershipManagement from './admin-console/AdminMembershipManagement'
import AdminEventManagement from './admin-console/AdminEventManagement'
import './admin/admin.css'
import './admin-console/admin-console.css'

// ── Admin login form ──────────────────────────────────────────────────────────
function AdminLoginForm({ onSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  function submit(e) {
    e.preventDefault()
    setErr('')
    setBusy(true)
    setTimeout(() => {
      if (adminLogin(email, password)) {
        onSuccess()
      } else {
        setErr('Invalid admin credentials')
      }
      setBusy(false)
    }, 400)
  }

  return (
    <div className="page">
      <Background variant="admin" />
      <header className="topbar glass" style={{ justifyContent: 'space-between' }}>
        <Logo size={30} />
        <Link to="/login" className="btn btn-white btn-sm">← Back to app</Link>
      </header>
      <main className="admin-login-wrap">
        <div className="admin-login-card glass">
          <span className="admin-login-icon"><Shield size={32} /></span>
          <h1>Admin Console</h1>
          <p className="muted" style={{ fontSize: 14, marginBottom: 24 }}>Platform administration — restricted access</p>
          <div className="admin-security-note">
            <AlertTriangle size={14} />
            <span>Front-end simulation only — not production-secure</span>
          </div>
          <form onSubmit={submit} className="auth-fields" style={{ marginTop: 24 }}>
            <label className="field"><Mail size={18} /><input type="email" placeholder="Admin email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="username" aria-label="Admin email" required /></label>
            <label className="field">
              <Lock size={18} />
              <input type={show ? 'text' : 'password'} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" aria-label="Admin password" required />
              <button type="button" className="eye" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button>
            </label>
            {err && <p className="form-error" role="alert">{err}</p>}
            <button className="btn btn-grad auth-submit" disabled={busy}>{busy ? 'Checking…' : 'Sign in to Admin Console'}</button>
          </form>
          <p className="muted" style={{ fontSize: 12, marginTop: 16, textAlign: 'center' }}>Demo credentials: admin@tribu.fr / admin2026!</p>
        </div>
      </main>
    </div>
  )
}

// ── Admin layout with sidebar ─────────────────────────────────────────────────
function AdminConsoleLayout({ onLogout }) {
  const [open, setOpen] = useState(false)
  const nav = useNavigate()

  const items = [
    ['/admin-console', 'Dashboard', LayoutDashboard],
    ['/admin-console/users', 'Users', Users],
    ['/admin-console/clubs', 'Clubs', Building2],
    ['/admin-console/memberships', 'Memberships', UserPlus],
    ['/admin-console/events', 'Events', Calendar],
    ['/admin-console/activity', 'Activity', Activity],
  ]

  function logout() {
    adminLogout()
    onLogout()
    nav('/login')
  }

  return (
    <div className="admin">
      <Background variant="admin" />
      <div className="admin-mobilebar glass">
        <button className="tb-circle" onClick={() => setOpen(true)} aria-label="Open menu"><Menu size={20} /></button>
        <Logo size={26} />
        <span className="pill" style={{ height: 28, padding: '0 10px', fontSize: 12, gap: 5 }}><Shield size={13} /> Admin</span>
      </div>
      {open && <div className="side-scrim" onClick={() => setOpen(false)} />}

      <aside className={'side glass ' + (open ? 'open' : '')}>
        <div className="side-top">
          <Link to="/home" aria-label="Back to app"><Logo size={30} /></Link>
          <button className="side-close" onClick={() => setOpen(false)} aria-label="Close menu"><X size={18} /></button>
        </div>
        <div style={{ padding: '12px 20px 8px' }}>
          <span className="pill" style={{ background: 'rgba(139,92,246,.15)', color: '#8b5cf6', border: '1px solid rgba(139,92,246,.3)', gap: 6, fontSize: 13 }}>
            <Shield size={14} /> Platform Admin
          </span>
        </div>
        <nav className="side-nav" aria-label="Admin navigation">
          {items.map(([to, label, I]) => (
            <NavLink key={to} to={to} end={to === '/admin-console'} className={({ isActive }) => 'side-item ' + (isActive ? 'on' : '')}>
              <I size={19} strokeWidth={1.8} /> <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="side-bottom">
          <div className="side-user" style={{ cursor: 'default' }}>
            <span className="avatar avatar-fallback" style={{ width: 42, height: 42, fontSize: 15 }}>AD</span>
            <span><b>Admin</b><small>admin@tribu.fr</small></span>
          </div>
          <button className="side-back" onClick={logout} style={{ color: '#c0394f', marginTop: 8 }}>
            <LogOut size={18} /> Sign out
          </button>
        </div>
      </aside>

      <main className="admin-main glass">
        <Outlet />
      </main>
    </div>
  )
}

// ── Main export: protected admin console ──────────────────────────────────────
export default function AdminConsole() {
  const [authed, setAuthed] = useState(isAdminAuthed())

  if (!authed) return <AdminLoginForm onSuccess={() => setAuthed(true)} />

  return (
    <Routes>
      <Route element={<AdminConsoleLayout onLogout={() => setAuthed(false)} />}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUserManagement />} />
        <Route path="clubs" element={<AdminClubManagement />} />
        <Route path="memberships" element={<AdminMembershipManagement />} />
        <Route path="events" element={<AdminEventManagement />} />
        <Route path="activity" element={<AdminActivityLog />} />
      </Route>
    </Routes>
  )
}

// ── Activity log page ─────────────────────────────────────────────────────────
function AdminActivityLog() {
  const log = getActivityLog()
  const icons = { registration: '👤', membership: '🤝', announcement: '📢', request: '📋', logout: '🚪' }

  return (
    <>
      <div className="a-head"><div><h1>Activity Log</h1><p>Recent platform events</p></div></div>
      <div className="a-card a-section">
        {log.length === 0 && <div className="empty-box">No activity recorded yet</div>}
        <div style={{ display: 'grid', gap: 1 }}>
          {log.map(e => (
            <div key={e.id} className="activity-row">
              <span className="activity-icon">{icons[e.type] || '📌'}</span>
              <span className="activity-label">{e.label}</span>
              <span className="activity-time muted">{new Date(e.ts).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
