import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Users, MapPin, Clock, Share2, LayoutDashboard, CalendarCheck, CalendarPlus } from 'lucide-react'
import TopBar from '../components/TopBar'
import JoinButton, { useMembership } from '../components/JoinButton'
import { Background, ClubIcon, Avatar, fmtDate } from '../components/ui'
import { useApp } from '../context/AppContext'
import * as api from '../api/mockApi'
import './club.css'

export default function ClubPage() {
  const { id } = useParams()
  const { user, rsvps, setRsvps, notify, clubEvents } = useApp()
  const [club, setClub] = useState(undefined)
  const [events, setEvents] = useState([])
  const [members, setMembers] = useState([])
  const status = useMembership(club)

  useEffect(() => {
    setClub(undefined)
    api.getClub(id).then(c => setClub(c || null))
    api.getEvents().then(setEvents)
    api.getMembers().then(setMembers)
  }, [id])

  if (club === undefined) return <div className="page"><Background /><TopBar /><div className="skeleton" style={{ height: 320, marginTop: 24 }} /></div>
  if (club === null) return <div className="page"><Background /><TopBar /><div className="panel glass club-missing"><h2>Club not found</h2><Link to="/home" className="btn btn-grad">Back to home</Link></div></div>

  // leader events come from the shared state so new events created in the dashboard show up here
  const evs = club.id === 'paris-piano' ? clubEvents.filter(e => e.status === 'Published') : events.filter(e => e.clubId === club.id)
  const isLeader = user.leaderOf?.includes(club.id)

  const toggle = e => {
    const on = !rsvps[e.id]
    setRsvps({ ...rsvps, [e.id]: on })
    notify(on ? `You're going to “${e.title}”` : 'RSVP cancelled')
  }

  return (
    <div className="page">
      <Background />
      <TopBar />
      <Link to="/home" className="back"><ArrowLeft size={17} /> Back</Link>

      <section className="club-hero glass">
        <img src={club.cover} alt="" className="club-hero-img" />
        <div className="club-hero-body">
          <ClubIcon club={club} size={72} />
          <div className="club-hero-text">
            <h1>{club.name}</h1>
            <p><span><Users size={16} /> {club.members + (status === 'member' && !user.clubs?.includes(club.id) ? 1 : 0)} members</span><span><MapPin size={16} /> {club.city} · {club.distance} km</span>
              {club.price > 0 ? <span className="pill tag-price">€{club.price} one-time</span> : <span className="pill tag-free">Free</span>}</p>
          </div>
          <div className="club-hero-actions">
            <button className="btn btn-white" onClick={() => { navigator.clipboard?.writeText(location.href).catch(() => {}); notify('Link copied') }}><Share2 size={17} /> Share</button>
            {isLeader ? <Link to={`/manage/${club.id}`} className="btn btn-grad"><LayoutDashboard size={17} /> Manage club</Link>
              : <JoinButton club={club} className="btn btn-grad" label="Join club" />}
          </div>
        </div>
      </section>

      <div className="club-cols">
        <section className="panel glass club-about">
          <h2>About</h2>
          <p>{club.description}</p>
          <div className="club-tags">{club.tags.map(t => <span key={t} className="pill">{t}</span>)}</div>
          <h2 style={{ marginTop: 26 }}>Upcoming events</h2>
          {evs.length === 0 && <p className="muted">No event planned yet.</p>}
          <div className="club-events">
            {evs.map(e => (
              <div key={e.id} className="club-ev card">
                <div className="ev-date"><small>{new Date(e.date + 'T12:00').toLocaleDateString('en-GB', { month: 'short' })}</small><b>{new Date(e.date + 'T12:00').getDate()}</b></div>
                <div className="ev-info"><b>{e.title}</b><span><Clock size={14} /> {fmtDate(e.date)} · {e.start} – {e.end}</span><span><MapPin size={14} /> {e.place}</span></div>
                {status === 'member' || isLeader
                  ? <button className={'btn btn-sm ' + (rsvps[e.id] ? 'btn-grad' : 'btn-white')} onClick={() => toggle(e)}>{rsvps[e.id] ? <><CalendarCheck size={15} /> Going</> : <><CalendarPlus size={15} /> RSVP</>}</button>
                  : <span className="muted ev-lock">Join to RSVP</span>}
              </div>
            ))}
          </div>
        </section>
        <aside className="panel glass club-side">
          <h2>Leader</h2>
          <div className="leader"><Avatar src={club.id === 'paris-piano' ? '/img/camille.jpg' : ''} name={club.leader} size={44} /><div><b>{club.leader}</b><small className="muted">Club leader</small></div></div>
          <h2 style={{ marginTop: 24 }}>Members</h2>
          <div className="mem-stack">{members.slice(0, 6).map(m => <Avatar key={m.id} src={m.avatar} name={m.name} size={38} ring />)}<span className="mem-more">+{club.members - 6}</span></div>
          <p className="muted" style={{ fontSize: 13, marginTop: 10 }}>Students from ECE Paris, Sorbonne, Sciences Po and more.</p>
        </aside>
      </div>
    </div>
  )
}
