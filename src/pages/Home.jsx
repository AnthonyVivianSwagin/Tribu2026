import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, Users, Clock, MapPin, ChevronRight, SearchX } from 'lucide-react'
import TopBar from '../components/TopBar'
import JoinButton from '../components/JoinButton'
import { Background, ClubIcon, Icon } from '../components/ui'
import { useApp } from '../context/AppContext'
import * as api from '../api/mockApi'
import './home.css'

const CATS = ['All', 'Music', 'Sport', 'Art', 'Tech', 'Gaming', 'Culture']

function greeting() {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
}

export function NextUpItem({ ev }) {
  const d = new Date(ev.date + 'T12:00')
  const day = d.toLocaleDateString('en-GB', { weekday: 'short' }).toUpperCase()
  return (
    <Link to={`/clubs/${ev.clubId}`} className="next-item card">
      <span className={'date-tile ' + (d.getDay() === 0 || d.getDay() === 6 ? 'pink' : '')}><small>{day}</small><b>{d.getDate()}</b></span>
      <span className="next-info">
        <b>{ev.title}</b>
        <span><Clock size={14} /> {ev.start} – {ev.end}</span>
        <span><MapPin size={14} /> {ev.place}</span>
      </span>
      <ChevronRight size={18} className="next-chev" />
    </Link>
  )
}

export default function Home() {
  const { user } = useApp()
  const [params] = useSearchParams()
  const q = (params.get('q') || '').toLowerCase()
  const [clubs, setClubs] = useState(null)
  const [events, setEvents] = useState([])
  const [cat, setCat] = useState('All')

  useEffect(() => {
    api.getClubs().then(setClubs)
    api.getEvents().then(setEvents)
  }, [])
  useEffect(() => {
    if (q) document.getElementById('suggested')?.scrollIntoView({ behavior: 'smooth' })
  }, [q])

  const mine = (clubs || []).filter(c => user.clubs?.includes(c.id))
  const suggested = useMemo(() => (clubs || [])
    .filter(c => !user.clubs?.includes(c.id)) // exclude already-joined clubs
    .filter(c => c.public !== false) // respect privacy setting
    .filter(c => cat === 'All' || c.tags.includes(cat))
    .filter(c => !q || (c.name + ' ' + c.tags.join(' ') + ' ' + c.city).toLowerCase().includes(q)), [clubs, cat, q, user.clubs])
  const today = new Date().toISOString().slice(0, 10)
  const next = events.filter(e => e.next && e.date >= today)

  return (
    <div className="page">
      <Background variant="home" />
      <TopBar />

      <div className="hello">
        <h1>{greeting()}, {user.firstName} <span className="wave" aria-hidden="true">👋</span></h1>
        <p>3 new events in your clubs this week</p>
      </div>

      <div className="home-row">
        <section className="panel glass myclubs">
          <div className="panel-head"><h2>My clubs</h2><Link to="/events" className="see-all">See all <ArrowRight size={15} /></Link></div>
          {!clubs ? <div className="club-grid">{[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: 182 }} />)}</div> : mine.length === 0 ? (
            <div className="empty">You haven't joined any club yet — pick one below 👇</div>
          ) : (
            <div className="club-grid">
              {mine.map(c => (
                <Link to={`/clubs/${c.id}`} key={c.id} className="club-card card">
                  <span className="club-cover"><img src={c.cover} alt="" /></span>
                  <ClubIcon club={c} />
                  {c.unread > 0 && <span className="badge club-badge" aria-label={`${c.unread} new`}>{c.unread}</span>}
                  <span className="club-name">{c.name}</span>
                  <span className="club-meta"><Users size={16} /> {c.members} members</span>
                </Link>
              ))}
            </div>
          )}
        </section>

        <aside className="panel glass nextup">
          <h2>Next up</h2>
          <div className="next-list">{next.map(e => <NextUpItem key={e.id} ev={e} />)}</div>
        </aside>
      </div>

      <section className="panel glass suggested" id="suggested">
        <div className="sugg-head">
          <h2>Suggested for you</h2>
          <div className="chips" role="tablist" aria-label="Filter by interest">
            {CATS.map(c => <button key={c} role="tab" aria-selected={cat === c} className={'chip ' + (cat === c ? 'on' : '')} onClick={() => setCat(c)}>{c}</button>)}
          </div>
        </div>
        {q && <p className="search-note">Results for “{params.get('q')}” · <Link to="/home">clear search</Link></p>}
        <div className="sugg-grid">
          {!clubs && [1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skeleton" style={{ height: 128 }} />)}
          {clubs && suggested.length === 0 && <div className="empty"><SearchX size={20} /> No club matches — try another interest.</div>}
          {suggested.map(c => (
            <Link to={`/clubs/${c.id}`} key={c.id} className="sugg card">
              <img src={c.cover} alt="" />
              <div className="sugg-body">
                <div className="sugg-title"><span className="icon-tile"><Icon name={c.icon} size={16} /></span><b>{c.name}</b></div>
                <div className="sugg-meta"><MapPin size={14} /> <span>{c.distance} km</span>{c.tags.map(t => <span className="pill" key={t}>{t}</span>)}</div>
                <div className="sugg-foot">
                  {c.price > 0 ? <span className="pill tag-price">€{c.price} one-time</span> : <span className="pill tag-free">Free</span>}
                  <JoinButton club={c} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
