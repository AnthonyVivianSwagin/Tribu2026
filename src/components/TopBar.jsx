import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Search, MapPin, Calendar, MessageCircle, Bell, Power, Settings, LayoutDashboard, RotateCcw } from 'lucide-react'
import { Logo, Avatar, Modal } from './ui'
import { useApp } from '../context/AppContext'
import './topbar.css'

function useOutside(ref, cb) {
  useEffect(() => {
    const h = e => ref.current && !ref.current.contains(e.target) && cb()
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [ref, cb])
}

export default function TopBar() {
  const { user, logout, notifs, setNotifs, setUser, notify, resetDemo } = useApp()
  const nav = useNavigate()
  const [params] = useSearchParams()
  const [q, setQ] = useState(params.get('q') || '')
  const [open, setOpen] = useState(null) // 'notif' | 'me'
  const [locOpen, setLocOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '', school: user?.school || '', city: user?.city || 'Paris' })
  const [loc, setLoc] = useState({ city: user?.city || 'Paris', radius: user?.radius || 10 })
  const ref = useRef(null)
  useOutside(ref, () => setOpen(null))
  const unread = notifs.filter(n => n.unread).length

  const go = e => { e.preventDefault(); nav('/home' + (q ? '?q=' + encodeURIComponent(q) : '') + '#suggested') }

  return (
    <header className="topbar glass" ref={ref}>
      <Link to="/home" className="tb-logo" aria-label="tribu home"><Logo size={30} /></Link>

      <form className="tb-search" onSubmit={go} role="search">
        <Search size={20} />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search clubs, interests, cities…" aria-label="Search clubs" />
        <button type="button" className="tb-loc" onClick={() => setLocOpen(true)}><MapPin size={16} /> {loc.city} · {loc.radius} km</button>
      </form>

      <nav className="tb-actions" aria-label="Main">
        <Link to="/events" className="tb-circle" aria-label="My calendar" title="My calendar"><Calendar size={20} /></Link>
        <Link to="/messages" className="tb-circle" aria-label="Messages" title="Messages"><MessageCircle size={20} /><span className="tb-dot" /></Link>
        <button className="tb-circle" aria-label={`Notifications, ${unread} unread`} onClick={() => setOpen(open === 'notif' ? null : 'notif')}>
          <Bell size={20} />{unread > 0 && <span className="badge tb-badge">{unread}</span>}
        </button>
        <button className="tb-avatar" aria-label="My account" onClick={() => setOpen(open === 'me' ? null : 'me')}><Avatar src={user?.avatar} name={user?.name} size={46} /></button>
        <button className="tb-circle" aria-label="Log out" title="Log out" onClick={() => { logout(); nav('/login') }}><Power size={20} /></button>
      </nav>

      {open === 'notif' && (
        <div className="dropdown notif-panel" role="dialog" aria-label="Notifications">
          <div className="dd-head"><b>Notifications</b><button onClick={() => setNotifs(notifs.map(n => ({ ...n, unread: false })))}>Mark all as read</button></div>
          {notifs.map(n => (
            <button key={n.id} className={'notif ' + (n.unread ? 'unread' : '')} onClick={() => setNotifs(notifs.map(x => x.id === n.id ? { ...x, unread: false } : x))}>
              <span className="notif-dot" /><span><span className="notif-text">{n.text}</span><small>{n.time}</small></span>
            </button>
          ))}
        </div>
      )}
      {open === 'me' && (
        <div className="dropdown me-panel">
          <div className="me-head"><Avatar src={user?.avatar} name={user?.name} size={40} /><div><b>{user?.name}</b><small>{user?.email}</small></div></div>
          {user?.leaderOf?.length > 0 && <Link to={`/manage/${user.leaderOf[0]}`} className="dd-item"><LayoutDashboard size={17} /> Manage my club</Link>}
          <button className="dd-item" onClick={() => { setProfile({ name: user?.name || '', email: user?.email || '', school: user?.school || '', city: user?.city || 'Paris' }); setOpen(null); setProfileOpen(true) }}><Settings size={17} /> Profile settings</button>
          <button className="dd-item" onClick={resetDemo}><RotateCcw size={17} /> Reset demo data</button>
        </div>
      )}

      {profileOpen && (
        <Modal title="Profile settings" sub="Update the details shown on your account." onClose={() => setProfileOpen(false)}
          actions={<button className="btn btn-grad" onClick={() => { setUser({ ...user, ...profile }); setProfileOpen(false); notify('Profile updated') }}>Save changes</button>}>
          <label className="label">Full name</label>
          <label className="field"><input value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} /></label>
          <label className="label" style={{ marginTop: 12 }}>Email</label>
          <label className="field"><input type="email" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} /></label>
          <label className="label" style={{ marginTop: 12 }}>School</label>
          <label className="field"><input value={profile.school} onChange={e => setProfile({ ...profile, school: e.target.value })} /></label>
          <label className="label" style={{ marginTop: 12 }}>City</label>
          <label className="field"><input value={profile.city} onChange={e => setProfile({ ...profile, city: e.target.value })} /></label>
        </Modal>
      )}

      {locOpen && (
        <Modal title="Your area" sub="We show clubs inside this radius." onClose={() => setLocOpen(false)}
          actions={<button className="btn btn-grad" onClick={() => { setLocOpen(false); setUser({ ...user, city: loc.city, radius: loc.radius }); notify(`Showing clubs within ${loc.radius} km of ${loc.city}`) }}>Save</button>}>
          <label className="label">City</label>
          <label className="field"><MapPin size={18} /><select value={loc.city} onChange={e => setLoc({ ...loc, city: e.target.value })}>{['Paris', 'Lyon', 'Lille', 'Bordeaux', 'Marseille'].map(c => <option key={c}>{c}</option>)}</select></label>
          <label className="label" style={{ marginTop: 16 }}>Radius: {loc.radius} km</label>
          <input type="range" min="5" max="30" value={loc.radius} onChange={e => setLoc({ ...loc, radius: +e.target.value })} style={{ width: '100%', accentColor: '#8b5cf6' }} />
        </Modal>
      )}
    </header>
  )
}
