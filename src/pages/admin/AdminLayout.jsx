import { useEffect, useState } from 'react'
import { NavLink, Link, Outlet, useParams, useLocation, Navigate } from 'react-router-dom'
import { House, Users, UserPlus, Calendar, Megaphone, MessageCircle, Settings, CreditCard, ArrowLeft, ChevronDown, ChevronRight, Menu, X } from 'lucide-react'
import { Background, Logo, ClubIcon, Avatar } from '../../components/ui'
import { useApp } from '../../context/AppContext'
import clubs from '../../data/clubs.json'
import './admin.css'

export default function AdminLayout() {
  const { clubId } = useParams()
  const { reqs, user, notify, clubProfile } = useApp()
  const [open, setOpen] = useState(false)
  const [pick, setPick] = useState(false)
  const loc = useLocation()
  useEffect(() => { setOpen(false); setPick(false) }, [loc.pathname])

  const baseClub = clubs.find(c => c.id === clubId)
  const club = baseClub ? { ...baseClub, ...(clubProfile || {}) } : null
  if (!club) return <Navigate to="/home" replace />
  if (!user.leaderOf?.includes(clubId)) return <Navigate to={`/clubs/${clubId}`} replace />

  const items = [
    ['', 'Overview', House], ['members', 'Members', Users], ['requests', 'Join requests', UserPlus, reqs.length],
    ['events', 'Events', Calendar], ['announcements', 'Announcements', Megaphone], ['messages', 'Messages', MessageCircle],
    ['settings', 'Club settings', Settings], ['payouts', 'Payouts', CreditCard],
  ]

  return (
    <div className="admin">
      <Background variant="admin" />
      <div className="admin-mobilebar glass">
        <button className="tb-circle" onClick={() => setOpen(true)} aria-label="Open menu"><Menu size={20} /></button>
        <Logo size={26} />
        <Avatar src={user?.avatar} name={user?.name || ''} size={40} />
      </div>
      {open && <div className="side-scrim" onClick={() => setOpen(false)} />}

      <aside className={'side glass ' + (open ? 'open' : '')}>
        <div className="side-top">
          <Link to="/home" aria-label="tribu home"><Logo size={30} /></Link>
          <button className="side-close" onClick={() => setOpen(false)} aria-label="Close menu"><X size={18} /></button>
        </div>
        <div className="club-switch-wrap">
          <button className="club-switch" onClick={() => setPick(!pick)} aria-expanded={pick}>
            <ClubIcon club={club} size={36} />
            <span>{club.name}</span>
            <ChevronDown size={18} />
          </button>
          {pick && (
            <div className="dropdown switch-dd">
              <div className="dd-item on"><ClubIcon club={club} size={28} /> {club.name}</div>
              <button className="dd-item" onClick={() => { setPick(false); notify('You only lead one club in this demo') }}>+ Create a new club</button>
            </div>
          )}
        </div>
        <nav className="side-nav" aria-label="Club management">
          {items.map(([to, label, I, count]) => (
            <NavLink key={label} to={to} end className={({ isActive }) => 'side-item ' + (isActive ? 'on' : '')}>
              <I size={19} strokeWidth={1.8} /> <span>{label}</span>{count > 0 && <span className="badge side-badge">{count}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="side-bottom">
          <Link to="/home" className="side-back"><ArrowLeft size={18} /> Back to home</Link>
          <Link to={`/clubs/${club.id}`} className="side-user">
            <Avatar src={user?.avatar} name={user?.name || ''} size={42} />
            <span><b>{user?.name || 'Club Leader'}</b><small>{user?.role || 'Leader'}</small></span>
            <ChevronRight size={18} />
          </Link>
        </div>
      </aside>

      <main className="admin-main glass">
        <Outlet context={{ club }} />
      </main>
    </div>
  )
}
