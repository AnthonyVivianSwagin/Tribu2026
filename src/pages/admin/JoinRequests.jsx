import { useState } from 'react'
import { CheckCircle, XCircle } from 'lucide-react'
import { Avatar } from '../../components/ui'
import { useApp } from '../../context/AppContext'

export default function JoinRequests() {
  const { reqs, setReqs, joined, setJoined, notify } = useApp()
  const [decided, setDecided] = useState([]) // track accepted/rejected for display

  const pending = reqs.filter(r => r.status === 'pending' || !r.status)

  function decide(r, ok) {
    // Update the request status
    const updatedReqs = reqs.map(x => x.id === r.id ? { ...x, status: ok ? 'accepted' : 'rejected' } : x)
    setReqs(updatedReqs)

    // If accepted and the student had a pending joined status, upgrade to member
    if (ok && r.userId) {
      setJoined(prev => ({ ...prev, [r.clubId || 'paris-piano']: 'member' }))
    } else if (!ok && r.userId) {
      // Remove their pending status so they can request again later
      setJoined(prev => {
        const j = { ...prev }
        if (j[r.clubId || 'paris-piano'] === 'pending') delete j[r.clubId || 'paris-piano']
        return j
      })
    }

    setDecided(prev => [...prev, { ...r, outcome: ok ? 'accepted' : 'rejected' }])
    notify(ok ? `${r.name.split(' ')[0]} is now a member 🎉` : `Request from ${r.name.split(' ')[0]} declined`)
  }

  function acceptAll() {
    const updated = reqs.map(r =>
      (r.status === 'pending' || !r.status) ? { ...r, status: 'accepted' } : r
    )
    setReqs(updated)
    notify(`${pending.length} student${pending.length !== 1 ? 's' : ''} accepted`)
  }

  return (
    <>
      <div className="a-head">
        <div>
          <h1>Join requests</h1>
          <p>{pending.length} student{pending.length !== 1 && 's'} waiting for an answer</p>
        </div>
        {pending.length > 1 && (
          <div className="a-head-actions">
            <button className="btn btn-white" onClick={acceptAll}>Accept all</button>
          </div>
        )}
      </div>

      {/* Pending requests */}
      {pending.length === 0 && <div className="a-card a-section empty-box">All caught up — no pending request 🎉</div>}
      <div className="req-big">
        {pending.map(r => (
          <div className="a-card req-card" key={r.id}>
            <div className="who">
              <Avatar src={r.avatar} name={r.name} size={48} />
              <div>
                <b>{r.name}</b>
                <small>{r.school} · {new Date(r.date + 'T12:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</small>
              </div>
            </div>
            <p>"{r.message}"</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-grad btn-sm" onClick={() => decide(r, true)}>
                <CheckCircle size={15} /> Accept
              </button>
              <button className="btn-decline" onClick={() => decide(r, false)}>
                <XCircle size={15} /> Decline
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Recently decided */}
      {decided.length > 0 && (
        <div className="a-card a-section" style={{ marginTop: 16 }}>
          <div className="a-card-head"><h2>Recently decided</h2></div>
          {decided.map(r => (
            <div className="req" key={r.id + '-decided'} style={{ opacity: 0.7 }}>
              <Avatar src={r.avatar} name={r.name} size={38} />
              <div className="req-who"><b>{r.name}</b><small>{r.school}</small></div>
              <span className={'status ' + (r.outcome === 'accepted' ? 'Published' : 'Cancelled')}>
                {r.outcome === 'accepted' ? '✓ Accepted' : '✗ Declined'}
              </span>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
