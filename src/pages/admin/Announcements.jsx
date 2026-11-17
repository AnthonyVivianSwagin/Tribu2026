import { useState } from 'react'
import { Megaphone, Trash2, Bell, BellOff } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { AnnouncementModal } from './shared'

export default function Announcements() {
  const { announcements, setAnnouncements, notify } = useApp()
  const [open, setOpen] = useState(false)

  function deleteAnn(id) {
    setAnnouncements(prev => prev.filter(x => x.id !== id))
    notify('Announcement deleted')
  }

  return (
    <>
      <div className="a-head">
        <div><h1>Announcements</h1><p>News sent to all your members</p></div>
        <div className="a-head-actions">
          <button className="btn btn-grad" onClick={() => setOpen(true)}><Megaphone size={18} /> Post announcement</button>
        </div>
      </div>
      <div className="a-section" style={{ display: 'grid', gap: 12 }}>
        {announcements.length === 0 && <div className="a-card empty-box">Nothing posted yet</div>}
        {announcements.map(a => (
          <article className="a-card ann" key={a.id}>
            <div className="a-card-head">
              <h3>{a.title}</h3>
              <button className="dots" aria-label="Delete announcement" onClick={() => deleteAnn(a.id)}>
                <Trash2 size={16} />
              </button>
            </div>
            <small>{new Date(a.date + 'T12:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })} · {a.audience}</small>
            <p>{a.body}</p>
          </article>
        ))}
      </div>
      {open && <AnnouncementModal onClose={() => setOpen(false)} />}
    </>
  )
}
