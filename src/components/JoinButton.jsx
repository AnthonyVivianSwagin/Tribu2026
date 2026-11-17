import { useState } from 'react'
import { Check, CreditCard, Clock } from 'lucide-react'
import { Modal } from './ui'
import { useApp } from '../context/AppContext'
import { logActivity } from '../api/mockApi'

// join logic shared by the home cards and the club page
export function useMembership(club) {
  const { user, joined } = useApp()
  if (!club) return null
  if (user?.clubs?.includes(club.id)) return 'member'
  return joined[club.id] || null
}

export default function JoinButton({ club, className = 'btn btn-white btn-sm join-btn', label = 'Join' }) {
  const { joined, setJoined, user, setUser, reqs, setReqs, notify } = useApp()
  const status = useMembership(club)
  const [pay, setPay] = useState(false)
  const [busy, setBusy] = useState(false)

  function confirm() {
    setBusy(true)
    setTimeout(() => {
      setJoined({ ...joined, [club.id]: 'member' })
      setUser({ ...user, clubs: [...(user.clubs || []), club.id] })
      setBusy(false); setPay(false)
      notify(`You joined ${club.name} 🎉`)
      logActivity({ type: 'membership', label: `${user?.name} joined ${club.name}`, userId: user?.id })
    }, 700)
  }

  function sendRequest() {
    // Add a join request visible to the club leader in their dashboard
    const alreadyPending = reqs.some(r => r.clubId === club.id && r.userId === user?.id)
    if (!alreadyPending) {
      const newReq = {
        id: 'req-' + Date.now(),
        clubId: club.id,
        userId: user?.id,
        name: user?.name || 'Anonymous',
        school: user?.school || 'Unknown',
        avatar: user?.avatar || '',
        date: new Date().toISOString().slice(0, 10),
        message: `I would love to join ${club.name}!`,
        status: 'pending'
      }
      setReqs([...reqs, newReq])
      logActivity({ type: 'request', label: `${user?.name} requested to join ${club.name}`, userId: user?.id })
    }
    setJoined({ ...joined, [club.id]: 'pending' })
    notify('Join request sent to the club leaders')
  }

  function click(e) {
    e.preventDefault(); e.stopPropagation()
    if (status === 'member') return
    if (status === 'pending') {
      // Cancel the request
      const j = { ...joined }; delete j[club.id]; setJoined(j)
      setReqs(reqs.filter(r => !(r.clubId === club.id && r.userId === user?.id)))
      return notify('Join request cancelled')
    }
    if (club.price > 0) return setPay(true)
    if (!club.public) return sendRequest()
    confirm()
  }

  const text = status === 'member' ? 'Joined' : status === 'pending' ? 'Requested' : label
  return (
    <>
      <button className={className + (status ? ' is-' + status : '')} onClick={click} aria-pressed={!!status}>
        {status === 'member' && <Check size={15} strokeWidth={2.5} />}
        {status === 'pending' && <Clock size={15} strokeWidth={2.5} />}
        {text}
      </button>
      {pay && (
        <Modal title={`Join ${club.name}`} sub="This club asks for a one-time membership fee." onClose={() => setPay(false)}
          actions={<><button className="btn btn-ghost" onClick={() => setPay(false)}>Cancel</button>
            <button className="btn btn-grad" disabled={busy} onClick={confirm}><CreditCard size={17} /> {busy ? 'Processing…' : `Pay €${club.price}`}</button></>}>
          <div className="pay-box">
            <div><span className="muted">One-time fee</span><b>€{club.price}.00</b></div>
            <div><span className="muted">Service fee</span><b>€0.00</b></div>
            <div className="pay-total"><span>Total</span><b>€{club.price}.00</b></div>
          </div>
          <p className="muted" style={{ fontSize: 13, marginTop: 12 }}>Demo only: no real payment is made, the checkout is simulated.</p>
        </Modal>
      )}
    </>
  )
}
