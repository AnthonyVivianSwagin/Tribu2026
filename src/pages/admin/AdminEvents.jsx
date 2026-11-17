import { useState } from 'react'
import { Plus, MapPin } from 'lucide-react'
import { fmtDate } from '../../components/ui'
import { useApp } from '../../context/AppContext'
import { EventModal, EventMenu } from './shared'

export default function AdminEvents() {
  const { clubEvents } = useApp()
  const [tab, setTab] = useState('All')
  const [create, setCreate] = useState(false)
  const list = clubEvents.filter(e => tab === 'All' || e.status === tab)
  return (
    <>
      <div className="a-head"><div><h1>Events</h1><p>Plan, publish and follow RSVPs</p></div>
        <div className="a-head-actions"><button className="btn btn-grad" onClick={() => setCreate(true)}><Plus size={18} /> Create event</button></div></div>
      <div className="toolbar"><div className="seg">{['All', 'Published', 'Draft', 'Cancelled'].map(t => <button key={t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{t} ({t === 'All' ? clubEvents.length : clubEvents.filter(e => e.status === t).length})</button>)}</div></div>
      <div className="a-card a-section scroll-x">
        <table className="ev-table" style={{ marginTop: 0 }}>
          <thead><tr><th>Event</th><th>Date</th><th className="hide-sm">RSVPs</th><th className="hide-sm">Status</th><th /></tr></thead>
          <tbody>
            {list.map(e => (
              <tr key={e.id}>
                <td><div className="ev-cell"><img src={e.img} alt="" /><div><b>{e.title}</b><small><MapPin size={12} /> {e.place}</small></div></div></td>
                <td className="ev-when"><b>{fmtDate(e.date)}</b><small>{e.start} – {e.end}</small></td>
                <td className="rsvp hide-sm"><b>{e.rsvp} / {e.capacity}</b><div className="bar"><i style={{ width: `${Math.min(100, (e.rsvp / e.capacity) * 100)}%` }} /></div></td>
                <td className="hide-sm"><span className={'status ' + e.status}>{e.status}</span></td>
                <td style={{ textAlign: 'right', position: 'relative' }}><EventMenu ev={e} /></td>
              </tr>
            ))}
            {list.length === 0 && <tr><td colSpan="5" className="empty-box">No event here yet</td></tr>}
          </tbody>
        </table>
      </div>
      {create && <EventModal onClose={() => setCreate(false)} />}
    </>
  )
}
