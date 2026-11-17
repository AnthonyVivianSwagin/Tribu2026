import { useEffect, useRef, useState } from 'react'
import { Ellipsis, Pencil, Send, EyeOff, Ban, Calendar, Clock, MapPin, Users, Type } from 'lucide-react'
import { Modal } from '../../components/ui'
import { useApp } from '../../context/AppContext'

const IMGS = ['/img/ev-piano.jpg', '/img/ev-sheet.jpg', '/img/ev-workshop.jpg']
const TODAY = new Date().toISOString().slice(0, 10)

// ── Event creation / edit modal ───────────────────────────────────────────────
export function EventModal({ onClose, ev }) {
  const { clubEvents, setClubEvents, notify } = useApp()
  // Default event date is 2 weeks from today
  const defaultDate = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10)
  const [f, setF] = useState(ev || { title: '', date: defaultDate, start: '19:00', end: '21:00', place: '', capacity: 30 })
  const [err, setErr] = useState('')
  const set = k => e => setF({ ...f, [k]: e.target.value })

  function save(status) {
    if (f.title.trim().length < 3) return setErr('Give your event a title (3 characters min.)')
    if (!f.place.trim()) return setErr('Where does it happen?')
    if (f.end <= f.start) return setErr('The end time must be after the start time')
    if (f.date < TODAY) return setErr('Event date must be in the future')

    if (ev) {
      setClubEvents(clubEvents.map(x => x.id === ev.id ? { ...x, ...f, capacity: +f.capacity } : x))
    } else {
      const newEvent = {
        ...f,
        capacity: +f.capacity || 20,
        id: 'e' + Date.now(),
        clubId: 'paris-piano',
        rsvp: 0,
        status,
        img: IMGS[clubEvents.length % 3]
      }
      setClubEvents([...clubEvents, newEvent].sort((a, b) => a.date.localeCompare(b.date)))
    }
    notify(ev ? 'Event updated' : status === 'Published' ? 'Event published — members are notified' : 'Draft saved')
    onClose()
  }

  return (
    <Modal title={ev ? 'Edit event' : 'Create event'} sub="Members of your club will see it in their calendar." onClose={onClose} wide
      actions={ev
        ? <button className="btn btn-grad" onClick={() => save(ev.status)}>Save changes</button>
        : <><button className="btn btn-white" onClick={() => save('Draft')}>Save as draft</button><button className="btn btn-grad" onClick={() => save('Published')}>Publish</button></>}>
      <div className="form-grid">
        <div className="full"><label className="label">Title</label><label className="field"><Type size={18} /><input value={f.title} onChange={set('title')} placeholder="e.g. Open jam session" autoFocus /></label></div>
        <div><label className="label">Date</label><label className="field"><Calendar size={18} /><input type="date" value={f.date} min={TODAY} onChange={set('date')} /></label></div>
        <div><label className="label">Capacity</label><label className="field"><Users size={18} /><input type="number" min="2" value={f.capacity} onChange={set('capacity')} /></label></div>
        <div><label className="label">Starts</label><label className="field"><Clock size={18} /><input type="time" value={f.start} onChange={set('start')} /></label></div>
        <div><label className="label">Ends</label><label className="field"><Clock size={18} /><input type="time" value={f.end} onChange={set('end')} /></label></div>
        <div className="full"><label className="label">Place</label><label className="field"><MapPin size={18} /><input value={f.place} onChange={set('place')} placeholder="e.g. Studio B · Paris 5e" /></label></div>
      </div>
      {err && <p className="form-error" style={{ marginTop: 12 }}>{err}</p>}
    </Modal>
  )
}

// ── Announcement modal ────────────────────────────────────────────────────────
export function AnnouncementModal({ onClose }) {
  const { postAnnouncement } = useApp()
  const [t, setT] = useState('')
  const [b, setB] = useState('')
  const [err, setErr] = useState('')

  function post() {
    if (!t.trim()) return setErr('Please enter a title')
    if (!b.trim()) return setErr('Please enter a message')
    postAnnouncement(t.trim(), b.trim())
    onClose()
  }

  return (
    <Modal title="Post announcement" sub="Sent to every member by notification." onClose={onClose}
      actions={<><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-grad" onClick={post}><Send size={16} /> Post</button></>}>
      <label className="label">Title</label>
      <label className="field"><input value={t} onChange={e => setT(e.target.value)} placeholder="e.g. New rehearsal room" autoFocus /></label>
      <label className="label" style={{ marginTop: 14 }}>Message</label>
      <label className="field area"><textarea value={b} onChange={e => setB(e.target.value)} placeholder="What do your members need to know?" /></label>
      {err && <p className="form-error" style={{ marginTop: 10 }}>{err}</p>}
    </Modal>
  )
}

// ── Event row dropdown menu ───────────────────────────────────────────────────
export function EventMenu({ ev }) {
  const { clubEvents, setClubEvents, notify } = useApp()
  const [open, setOpen] = useState(false)
  const [edit, setEdit] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const h = e => ref.current && !ref.current.contains(e.target) && setOpen(false)
    document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h)
  }, [])
  const setStatus = s => {
    setClubEvents(clubEvents.map(x => x.id === ev.id ? { ...x, status: s } : x))
    setOpen(false)
    notify(`"${ev.title}" is now ${s.toLowerCase()}`)
  }
  return (
    <span ref={ref}>
      <button className="dots" onClick={() => setOpen(!open)} aria-label={`Actions for ${ev.title}`} aria-expanded={open}><Ellipsis size={18} /></button>
      {open && (
        <div className="row-menu">
          <button className="dd-item" onClick={() => { setOpen(false); setEdit(true) }}><Pencil size={15} /> Edit</button>
          {ev.status === 'Draft' && <button className="dd-item" onClick={() => setStatus('Published')}><Send size={15} /> Publish</button>}
          {ev.status === 'Published' && <button className="dd-item" onClick={() => setStatus('Draft')}><EyeOff size={15} /> Unpublish</button>}
          {ev.status !== 'Cancelled' && <button className="dd-item" style={{ color: '#c0394f' }} onClick={() => setStatus('Cancelled')}><Ban size={15} /> Cancel event</button>}
        </div>
      )}
      {edit && <EventModal ev={ev} onClose={() => setEdit(false)} />}
    </span>
  )
}
