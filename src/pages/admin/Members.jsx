import { useEffect, useState } from 'react'
import { Search, UserMinus, Download } from 'lucide-react'
import { Avatar, Modal } from '../../components/ui'
import { useApp } from '../../context/AppContext'
import * as api from '../../api/mockApi'

export default function Members() {
  const { notify } = useApp()
  const [list, setList] = useState(null)
  const [q, setQ] = useState('')
  const [role, setRole] = useState('All')
  const [remove, setRemove] = useState(null)
  useEffect(() => { api.getMembers().then(setList) }, [])

  const shown = (list || []).filter(m => (role === 'All' || m.role === role) && (m.name + m.school).toLowerCase().includes(q.toLowerCase()))

  function exportCsv() {
    const rows = [['Name', 'School', 'Role', 'Joined', 'Events'], ...list.map(m => [m.name, m.school, m.role, m.joined, m.events])]
    const blob = new Blob([rows.map(r => r.join(';')).join('\n')], { type: 'text/csv' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'members.csv'; a.click()
  }

  return (
    <>
      <div className="a-head"><div><h1>Members</h1><p>{list ? list.length : '…'} people in your club</p></div>
        <div className="a-head-actions"><button className="btn btn-white" onClick={exportCsv} disabled={!list}><Download size={17} /> Export CSV</button></div></div>
      <div className="toolbar">
        <label className="field"><Search size={18} /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search a member" aria-label="Search a member" /></label>
        <div className="seg">{['All', 'Leader', 'Co-leader', 'Member'].map(r => <button key={r} className={role === r ? 'on' : ''} onClick={() => setRole(r)}>{r}</button>)}</div>
      </div>
      <div className="a-card a-section scroll-x">
        {!list ? <div className="skeleton" style={{ height: 300 }} /> : (
          <table className="table">
            <thead><tr><th>Member</th><th className="hide-sm">Joined</th><th className="hide-sm">Events</th><th>Role</th><th /></tr></thead>
            <tbody>
              {shown.map(m => (
                <tr key={m.id}>
                  <td><div className="who"><Avatar src={m.avatar} name={m.name} size={38} /><div><b>{m.name}</b><small>{m.school}</small></div></div></td>
                  <td className="hide-sm">{new Date(m.joined).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td className="hide-sm">{m.events}</td>
                  <td>{m.role === 'Leader' ? <span className="status Published">Leader</span> :
                    <select className="role-sel" value={m.role} aria-label={`Role of ${m.name}`} onChange={e => { setList(list.map(x => x.id === m.id ? { ...x, role: e.target.value } : x)); notify(`${m.name} is now ${e.target.value.toLowerCase()}`) }}>
                      <option>Member</option><option>Co-leader</option></select>}</td>
                  <td style={{ textAlign: 'right' }}>{m.role !== 'Leader' && <button className="dots" aria-label={`Remove ${m.name}`} onClick={() => setRemove(m)}><UserMinus size={17} /></button>}</td>
                </tr>
              ))}
              {shown.length === 0 && <tr><td colSpan="5" className="empty-box">No member found</td></tr>}
            </tbody>
          </table>
        )}
      </div>
      {remove && <Modal title={`Remove ${remove.name}?`} sub="They will lose access to events and messages." onClose={() => setRemove(null)}
        actions={<><button className="btn btn-ghost" onClick={() => setRemove(null)}>Cancel</button><button className="btn btn-grad" onClick={() => { setList(list.filter(x => x.id !== remove.id)); notify(`${remove.name} was removed`); setRemove(null) }}>Remove</button></>} />}
    </>
  )
}
