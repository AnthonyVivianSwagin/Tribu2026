/**
 * AdminDashboard.jsx — Platform Admin Dashboard
 * Shows live statistics calculated from actual application data.
 */

import { useEffect, useState } from 'react'
import { Users, Building2, Calendar, UserPlus, Megaphone, TrendingUp, Activity, Shield, Clock } from 'lucide-react'
import { getAllUsers, getActivityLog } from '../../api/mockApi'
import { useApp } from '../../context/AppContext'
import clubs from '../../data/clubs.json'

function StatCard({ icon: I, label, value, sub, color = '#8b5cf6', bg = '#efe8fd' }) {
  return (
    <div className="kpi">
      <span className="kpi-ic" style={{ background: bg, color }}><I size={22} strokeWidth={1.8} /></span>
      <div>
        <span className="kpi-label">{label}</span>
        <span className="kpi-val">{value}</span>
        {sub && <span className="kpi-sub">{sub}</span>}
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const { reqs, announcements, clubEvents, membership } = useApp()
  const [users, setUsers] = useState([])
  const [log, setLog] = useState([])

  useEffect(() => {
    setUsers(getAllUsers())
    setLog(getActivityLog())
  }, [])

  const today = new Date().toISOString().slice(0, 10)
  const pendingReqs = reqs.filter(r => r.status === 'pending' || !r.status).length
  const upcomingEvents = clubEvents.filter(e => e.status === 'Published' && e.date >= today).length
  const unreadAnn = announcements.length // announcements visible to all members
  const publicClubs = clubs.filter(c => c.public !== false).length

  const activityIcons = { registration: '👤', membership: '🤝', announcement: '📢', request: '📋', logout: '🚪' }

  return (
    <>
      <div className="a-head">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Platform overview — all data is live from application state</p>
        </div>
        <div className="a-head-actions">
          <span className="pill" style={{ background: 'rgba(139,92,246,.12)', color: '#8b5cf6', border: '1px solid rgba(139,92,246,.25)', gap: 6, fontSize: 13, height: 36, padding: '0 14px' }}>
            <Shield size={14} /> Admin session active
          </span>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="kpis" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <StatCard icon={Users} label="Registered Users" value={users.length} sub="in users registry" color="#5b7cf0" bg="#e4ebff" />
        <StatCard icon={Building2} label="Total Clubs" value={clubs.length} sub={`${publicClubs} public`} color="#8b5cf6" bg="#efe8fd" />
        <StatCard icon={UserPlus} label="Pending Requests" value={pendingReqs} sub="awaiting decision" color="#e05ad0" bg="#fde6f6" />
        <StatCard icon={Calendar} label="Upcoming Events" value={upcomingEvents} sub="published & future" color="#38a8d6" bg="#dff4fb" />
        <StatCard icon={Megaphone} label="Announcements" value={announcements.length} sub="posted this season" color="#f59e0b" bg="#fef3c7" />
        <StatCard icon={Activity} label="Activity Events" value={log.length} sub="in activity log" color="#1f9d66" bg="#dcf3e8" />
      </div>

      <div className="a-row" style={{ marginTop: 20 }}>
        {/* Quick Stats Table */}
        <section className="a-card" style={{ flex: 2 }}>
          <div className="a-card-head"><h2>Club Directory Overview</h2></div>
          <div className="scroll-x">
            <table className="table">
              <thead><tr><th>Club</th><th>Category</th><th>Members</th><th>Fee</th><th>Status</th></tr></thead>
              <tbody>
                {clubs.map(c => (
                  <tr key={c.id}>
                    <td><b>{c.name}</b><br /><small className="muted">{c.city}</small></td>
                    <td>{c.category}</td>
                    <td>{c.members}</td>
                    <td>{c.price > 0 ? `€${c.price}` : 'Free'}</td>
                    <td><span className={'status ' + (c.public !== false ? 'Published' : 'Draft')}>{c.public !== false ? 'Public' : 'Private'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Recent Activity */}
        <section className="a-card" style={{ flex: 1, minWidth: 260 }}>
          <div className="a-card-head"><h2>Recent Activity</h2></div>
          {log.length === 0
            ? <p className="muted" style={{ fontSize: 14, padding: 8 }}>No activity recorded yet. Use the app to generate events.</p>
            : (
              <div style={{ display: 'grid', gap: 2 }}>
                {log.slice(0, 10).map(e => (
                  <div key={e.id} className="activity-row">
                    <span className="activity-icon">{activityIcons[e.type] || '📌'}</span>
                    <span className="activity-label" style={{ flex: 1 }}>{e.label}</span>
                    <span className="activity-time muted">
                      <Clock size={12} /> {new Date(e.ts).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
        </section>
      </div>

      {/* Users Summary */}
      <section className="a-card a-section" style={{ marginTop: 16 }}>
        <div className="a-card-head"><h2>Registered Users</h2><span className="muted" style={{ fontSize: 13 }}>{users.length} accounts</span></div>
        {users.length === 0
          ? <p className="muted" style={{ fontSize: 14 }}>No registered users yet. Users appear here after they sign up through the app.</p>
          : (
            <div className="scroll-x">
              <table className="table">
                <thead><tr><th>User</th><th className="hide-sm">Email</th><th className="hide-sm">School</th><th>Role</th><th className="hide-sm">Clubs</th><th className="hide-sm">Joined</th></tr></thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td><b>{u.name}</b></td>
                      <td className="hide-sm"><small>{u.email}</small></td>
                      <td className="hide-sm"><small>{u.school || '—'}</small></td>
                      <td><span className={'status ' + (u.role === 'admin' ? 'Published' : 'Draft')}>{u.role || 'student'}</span></td>
                      <td className="hide-sm">{u.clubs?.length || 0}</td>
                      <td className="hide-sm"><small>{u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-GB') : '—'}</small></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </section>
    </>
  )
}
