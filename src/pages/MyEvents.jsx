import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import TopBar from '../components/TopBar'
import { Background } from '../components/ui'
import { NextUpItem } from './Home'
import { useApp } from '../context/AppContext'
import * as api from '../api/mockApi'
import './club.css'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function MyEvents() {
  const { user, clubEvents } = useApp()
  const [events, setEvents] = useState([])
  const [month, setMonth] = useState(new Date()) // current month
  const [picked, setPicked] = useState(null)

  // paris-piano events come from the leader state, skip the static copy so they are not listed twice
  useEffect(() => { api.getEvents().then(e => setEvents(e.filter(x => x.rsvp == null && x.clubId !== 'paris-piano'))) }, [])
  const all = [...events, ...clubEvents.filter(e => e.status === 'Published')].filter(e => user.clubs?.includes(e.clubId))

  const y = month.getFullYear(), m = month.getMonth()
  const first = (new Date(y, m, 1).getDay() + 6) % 7
  const count = new Date(y, m + 1, 0).getDate()
  const cells = [...Array(first).fill(null), ...Array.from({ length: count }, (_, i) => i + 1)]
  const key = d => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  const list = all.filter(e => picked ? e.date === key(picked) : e.date.startsWith(key(1).slice(0, 7))).sort((a, b) => a.date.localeCompare(b.date))

  return (
    <div className="page">
      <Background />
      <TopBar />
      <div className="hello"><h1>My calendar</h1><p>Events from the clubs you joined</p></div>
      <div className="club-cols">
        <section className="panel glass club-about">
          <div className="cal-head">
            <h2>{month.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</h2>
            <div><button className="tb-circle cal-nav" aria-label="Previous month" onClick={() => { setPicked(null); setMonth(new Date(y, m - 1, 1)) }}><ChevronLeft size={18} /></button>
              <button className="tb-circle cal-nav" aria-label="Next month" onClick={() => { setPicked(null); setMonth(new Date(y, m + 1, 1)) }}><ChevronRight size={18} /></button></div>
          </div>
          <div className="cal">
            {DAYS.map(d => <span key={d} className="cal-dow">{d}</span>)}
            {cells.map((d, i) => {
              const has = d && all.some(e => e.date === key(d))
              return d ? <button key={i} className={'cal-day ' + (has ? 'has ' : '') + (picked === d ? 'on' : '')} onClick={() => setPicked(picked === d ? null : d)}>{d}</button> : <span key={i} />
            })}
          </div>
        </section>
        <aside className="panel glass club-side">
          <h2>{picked ? `${picked} ${month.toLocaleDateString('en-GB', { month: 'short' })}` : 'This month'}</h2>
          <div className="next-list">
            {list.length === 0 && <p className="muted">Nothing planned.</p>}
            {list.map(e => <NextUpItem key={e.id} ev={e} />)}
          </div>
        </aside>
      </div>
    </div>
  )
}
