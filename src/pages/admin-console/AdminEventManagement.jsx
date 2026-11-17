import { useApp } from '../../context/AppContext'
import { fmtDate } from '../../components/ui'
import { MapPin } from 'lucide-react'

export default function AdminEventManagement() {
  const { clubEvents } = useApp()
  const today = new Date().toISOString().slice(0, 10)
  const upcoming = clubEvents.filter(e => e.date >= today && e.status !== 'Cancelled').sort((a, b) => a.date.localeCompare(b.date))
  const past = clubEvents.filter(e => e.date < today).sort((a, b) => b.date.localeCompare(a.date))
  const cancelled = clubEvents.filter(e => e.status === 'Cancelled')

  const Table = ({ rows, empty }) => (
    <div className="scroll-x">
      <table className="ev-table" style={{ marginTop: 0 }}>
        <thead><tr><th>Event</th><th>Date</th><th className="hide-sm">RSVPs</th><th className="hide-sm">Club</th><th>Status</th></tr></thead>
        <tbody>
          {rows.length === 0 ? <tr><td colSpan="5" className="empty-box">{empty}</td></tr>
            : rows.map(e => (
              <tr key={e.id}>
                <td><div className="ev-cell"><img src={e.img || '/img/ev-piano.jpg'} alt="" /><div><b>{e.title}</b><small><MapPin size={12} /> {e.place}</small></div></div></td>
                <td className="ev-when"><b>{fmtDate(e.date)}</b><small>{e.start} – {e.end}</small></td>
                <td className="hide-sm">{e.rsvp !== undefined ? `${e.rsvp} / ${e.capacity}` : '—'}</td>
                <td className="hide-sm"><small>{e.clubId}</small></td>
                <td><span className={'status ' + e.status}>{e.status}</span></td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )

  return (
    <>
      <div className="a-head"><div><h1>Event Management</h1><p>All club events across the platform</p></div></div>

      <div className="kpis" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 16 }}>
        <div className="kpi"><span className="kpi-ic" style={{ background: '#dff4fb', color: '#38a8d6' }}></span><div><span className="kpi-label">Upcoming</span><span className="kpi-val">{upcoming.length}</span></div></div>
        <div className="kpi"><span className="kpi-ic" style={{ background: '#f3f3f3', color: '#888' }}></span><div><span className="kpi-label">Past</span><span className="kpi-val">{past.length}</span></div></div>
        <div className="kpi"><span className="kpi-ic" style={{ background: '#fde8ea', color: '#c0394f' }}></span><div><span className="kpi-label">Cancelled</span><span className="kpi-val">{cancelled.length}</span></div></div>
      </div>

      <section className="a-card a-section">
        <div className="a-card-head"><h2>Upcoming Events</h2></div>
        <Table rows={upcoming} empty="No upcoming events scheduled." />
      </section>

      {past.length > 0 && (
        <section className="a-card a-section" style={{ marginTop: 14 }}>
          <div className="a-card-head"><h2>Past Events</h2></div>
          <Table rows={past} empty="" />
        </section>
      )}
    </>
  )
}
