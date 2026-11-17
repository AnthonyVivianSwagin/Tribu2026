import { useState } from 'react'
import { Search } from 'lucide-react'
import { ClubIcon } from '../../components/ui'
import clubs from '../../data/clubs.json'

const CATEGORIES = ['All', 'Music', 'Sport', 'Art', 'Tech', 'Gaming', 'Culture']

export default function AdminClubManagement() {
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('All')
  const [list, setList] = useState(() =>
    clubs.map((c, i) => ({ ...c, state: i === 7 ? 'Reported' : 'Active' }))
  )

  const shown = list.filter(c =>
    (cat === 'All' || c.category === cat) &&
    (c.name + c.city + c.category).toLowerCase().includes(q.toLowerCase())
  )

  function toggleSuspend(c) {
    setList(list.map(x => x.id === c.id
      ? { ...x, state: x.state === 'Suspended' ? 'Active' : 'Suspended' }
      : x
    ))
  }

  const statusClass = s => s === 'Active' ? 'Published' : s === 'Reported' ? 'Draft' : 'Cancelled'

  return (
    <>
      <div className="a-head">
        <div><h1>Club Management</h1><p>{clubs.length} clubs on the platform</p></div>
      </div>

      {/* Stats */}
      <div className="kpis" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', marginBottom: 16 }}>
        {[
          ['Total', list.length, '#8b5cf6', '#efe8fd'],
          ['Active', list.filter(c => c.state === 'Active').length, '#1f9d66', '#dcf3e8'],
          ['Reported', list.filter(c => c.state === 'Reported').length, '#f59e0b', '#fef3c7'],
          ['Suspended', list.filter(c => c.state === 'Suspended').length, '#c0394f', '#fde8ea'],
        ].map(([label, val, color, bg]) => (
          <div className="kpi" key={label}>
            <span className="kpi-ic" style={{ background: bg, color, width: 44, height: 44 }}></span>
            <div><span className="kpi-label">{label}</span><span className="kpi-val">{val}</span></div>
          </div>
        ))}
      </div>

      <div className="toolbar">
        <label className="field"><Search size={18} /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search clubs…" aria-label="Search clubs" /></label>
        <div className="seg">{CATEGORIES.map(c => <button key={c} className={cat === c ? 'on' : ''} onClick={() => setCat(c)}>{c}</button>)}</div>
      </div>

      <div className="a-card a-section scroll-x">
        <table className="table">
          <thead><tr><th>Club</th><th className="hide-sm">Category</th><th className="hide-sm">Members</th><th className="hide-sm">Fee</th><th>Visibility</th><th>Status</th><th /></tr></thead>
          <tbody>
            {shown.map(c => (
              <tr key={c.id}>
                <td>
                  <div className="who">
                    <ClubIcon club={c} size={36} />
                    <div><b>{c.name}</b><small>{c.city}</small></div>
                  </div>
                </td>
                <td className="hide-sm">{c.category}</td>
                <td className="hide-sm">{c.members}</td>
                <td className="hide-sm">{c.price > 0 ? `€${c.price}` : 'Free'}</td>
                <td><span className={'status ' + (c.public !== false ? 'Published' : 'Draft')}>{c.public !== false ? 'Public' : 'Private'}</span></td>
                <td><span className={'status ' + statusClass(c.state)}>{c.state}</span></td>
                <td style={{ textAlign: 'right' }}>
                  <button className="btn btn-white btn-sm" onClick={() => toggleSuspend(c)}>
                    {c.state === 'Suspended' ? 'Reactivate' : 'Suspend'}
                  </button>
                </td>
              </tr>
            ))}
            {shown.length === 0 && <tr><td colSpan="7" className="empty-box">No clubs match the filter.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  )
}
