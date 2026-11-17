import { useApp } from '../../context/AppContext'
import { Avatar } from '../../components/ui'
import { CheckCircle, XCircle } from 'lucide-react'

export default function AdminMembershipManagement() {
  const { reqs, setReqs, notify } = useApp()

  const pending = reqs.filter(r => r.status === 'pending' || !r.status)
  const accepted = reqs.filter(r => r.status === 'accepted')
  const rejected = reqs.filter(r => r.status === 'rejected')

  function decide(r, ok) {
    setReqs(reqs.map(x => x.id === r.id ? { ...x, status: ok ? 'accepted' : 'rejected' } : x))
    notify(ok ? `${r.name.split(' ')[0]} accepted` : `${r.name.split(' ')[0]} declined`)
  }

  const Row = ({ r, actions }) => (
    <tr key={r.id}>
      <td>
        <div className="who">
          <Avatar src={r.avatar} name={r.name} size={36} />
          <div><b>{r.name}</b><small>{r.school}</small></div>
        </div>
      </td>
      <td className="hide-sm"><small>{r.clubId || 'paris-piano'}</small></td>
      <td className="hide-sm"><small>{new Date(r.date + 'T12:00').toLocaleDateString('en-GB')}</small></td>
      <td><span className={'status ' + (r.status === 'accepted' ? 'Published' : r.status === 'rejected' ? 'Cancelled' : 'Draft')}>{r.status || 'pending'}</span></td>
      {actions && <td style={{ textAlign: 'right' }}>
        <button className="btn btn-grad btn-sm" style={{ marginRight: 6 }} onClick={() => decide(r, true)}><CheckCircle size={14} /></button>
        <button className="btn-decline" onClick={() => decide(r, false)}><XCircle size={14} /></button>
      </td>}
    </tr>
  )

  const TableWrap = ({ rows, showActions, empty }) => (
    <div className="scroll-x">
      <table className="table">
        <thead><tr><th>Student</th><th className="hide-sm">Club</th><th className="hide-sm">Date</th><th>Status</th>{showActions && <th />}</tr></thead>
        <tbody>
          {rows.length === 0 ? <tr><td colSpan="5" className="empty-box">{empty}</td></tr>
            : rows.map(r => <Row key={r.id} r={r} actions={showActions} />)}
        </tbody>
      </table>
    </div>
  )

  return (
    <>
      <div className="a-head"><div><h1>Membership Management</h1><p>All join requests across the platform</p></div></div>

      <div className="kpis" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 16 }}>
        <div className="kpi"><span className="kpi-ic" style={{ background: '#fef3c7', color: '#f59e0b' }}></span><div><span className="kpi-label">Pending</span><span className="kpi-val">{pending.length}</span></div></div>
        <div className="kpi"><span className="kpi-ic" style={{ background: '#dcf3e8', color: '#1f9d66' }}></span><div><span className="kpi-label">Accepted</span><span className="kpi-val">{accepted.length}</span></div></div>
        <div className="kpi"><span className="kpi-ic" style={{ background: '#fde8ea', color: '#c0394f' }}></span><div><span className="kpi-label">Rejected</span><span className="kpi-val">{rejected.length}</span></div></div>
      </div>

      <section className="a-card a-section">
        <div className="a-card-head"><h2>Pending Requests</h2></div>
        <TableWrap rows={pending} showActions empty="No pending requests 🎉" />
      </section>

      {accepted.length > 0 && (
        <section className="a-card a-section" style={{ marginTop: 14 }}>
          <div className="a-card-head"><h2>Accepted</h2></div>
          <TableWrap rows={accepted} empty="" />
        </section>
      )}

      {rejected.length > 0 && (
        <section className="a-card a-section" style={{ marginTop: 14 }}>
          <div className="a-card-head"><h2>Rejected</h2></div>
          <TableWrap rows={rejected} empty="" />
        </section>
      )}
    </>
  )
}
