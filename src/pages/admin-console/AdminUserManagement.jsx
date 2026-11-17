import { useState } from 'react'
import { Search, Shield } from 'lucide-react'
import { getAllUsers } from '../../api/mockApi'

export default function AdminUserManagement() {
  const [users] = useState(() => getAllUsers())
  const [q, setQ] = useState('')
  const [roleFilter, setRoleFilter] = useState('All')

  const shown = users.filter(u =>
    (roleFilter === 'All' || (u.role || 'student') === roleFilter) &&
    (u.name + u.email + (u.school || '')).toLowerCase().includes(q.toLowerCase())
  )

  return (
    <>
      <div className="a-head"><div><h1>User Management</h1><p>{users.length} registered accounts</p></div></div>
      <div className="toolbar">
        <label className="field"><Search size={18} /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by name, email or school" aria-label="Search users" /></label>
        <div className="seg">{['All', 'student', 'admin'].map(r => <button key={r} className={roleFilter === r ? 'on' : ''} onClick={() => setRoleFilter(r)}>{r.charAt(0).toUpperCase() + r.slice(1)}</button>)}</div>
      </div>
      <div className="a-card a-section scroll-x">
        {users.length === 0 ? (
          <div className="empty-box">No users registered yet. Users appear here after signing up through the application.</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th className="hide-sm">Email</th>
                <th className="hide-sm">School</th>
                <th className="hide-sm">City</th>
                <th>Role</th>
                <th className="hide-sm">Clubs</th>
                <th className="hide-sm">Registered</th>
              </tr>
            </thead>
            <tbody>
              {shown.map(u => (
                <tr key={u.id}>
                  <td>
                    <div className="who">
                      <span className="avatar avatar-fallback" style={{ width: 36, height: 36, fontSize: 13 }}>
                        {u.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                      </span>
                      <div><b>{u.name}</b><small>{u.firstName}</small></div>
                    </div>
                  </td>
                  <td className="hide-sm"><small>{u.email}</small></td>
                  <td className="hide-sm"><small>{u.school || '—'}</small></td>
                  <td className="hide-sm"><small>{u.city || '—'}</small></td>
                  <td>
                    <span className={'status ' + (u.role === 'admin' ? 'Published' : 'Draft')}>
                      {u.role === 'admin' && <Shield size={12} style={{ display: 'inline', marginRight: 4 }} />}
                      {u.role || 'student'}
                    </span>
                  </td>
                  <td className="hide-sm">{u.clubs?.length || 0}</td>
                  <td className="hide-sm"><small>{u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-GB') : '—'}</small></td>
                </tr>
              ))}
              {shown.length === 0 && <tr><td colSpan="7" className="empty-box">No users match the current filter.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}
