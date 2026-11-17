import { useEffect, useRef, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { Plus, Megaphone, Users, Database, Calendar, ChartNoAxesColumn, ArrowUp, ArrowRight, ChevronDown, MapPin, Ellipsis, Tag, Globe } from 'lucide-react'
import { Avatar, Modal, fmtDate } from '../../components/ui'
import { useApp } from '../../context/AppContext'
import * as api from '../../api/mockApi'
import { EventModal, AnnouncementModal, EventMenu } from './shared'

function Chart({ data }) {
  const [hover, setHover] = useState(data.length - 1)
  const [W, setW] = useState(634)
  const box = useRef(null)
  useEffect(() => setHover(data.length - 1), [data])
  // draw at the real pixel width so text never gets stretched on small screens
  useEffect(() => {
    const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width)))
    ro.observe(box.current)
    return () => ro.disconnect()
  }, [])
  const x0 = 34, x1 = W - 22, step = (x1 - x0) / (data.length - 1), y = v => 131 - v * 2
  const pts = data.map((d, i) => [x0 + i * step, y(d.v)])
  const line = pts.map((p, i) => (i ? 'L' : 'M') + p[0] + ' ' + p[1]).join(' ')
  const area = line + ` L ${pts.at(-1)[0]} 131 L ${pts[0][0]} 131 Z`
  const h = pts[hover], prev = data[hover].n ?? (hover > 0 ? data[hover].v - data[hover - 1].v : 0)
  const showLabel = i => W > 520 ? (data.length <= 6 || i % 2 === 1) : i % (data.length > 6 ? 3 : 1) === (data.length > 6 ? 2 : 0) || i === data.length - 1
  const tipLeft = Math.min(Math.max(h[0] - (hover === data.length - 1 ? 64 : 0), 60), W - 60)
  return (
    <div ref={box} style={{ position: 'relative' }}>
      <svg className="chart" width={W} height="178" viewBox={`0 0 ${W} 178`} role="img" aria-label={`Member growth, now ${data.at(-1).v} members`}>
        <defs><linearGradient id="ar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8b5cf6" stopOpacity=".28" /><stop offset="1" stopColor="#8b5cf6" stopOpacity="0" /></linearGradient></defs>
        {[60, 45, 30, 15, 0].map(v => <g key={v}><line x1="30" x2={W} y1={y(v)} y2={y(v)} stroke="rgba(120,100,170,.14)" /><text x="0" y={y(v) + 4}>{v}</text></g>)}
        <path d={area} fill="url(#ar)" />
        <path d={line} fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeLinejoin="round" />
        {pts.map((p, i) => (
          <g key={i} onMouseEnter={() => setHover(i)} onClick={() => setHover(i)} style={{ cursor: 'pointer' }}>
            <circle cx={p[0]} cy={p[1]} r="14" fill="transparent" />
            <circle cx={p[0]} cy={p[1]} r="4.5" fill="#fff" stroke="#8b5cf6" strokeWidth="2.5" />
            {showLabel(i) && <text x={p[0]} y="166" textAnchor={i === 0 ? 'start' : i === data.length - 1 ? 'end' : 'middle'} dx={i === 0 ? -4 : i === data.length - 1 ? 8 : 0}>{data[i].m}</text>}
          </g>
        ))}
      </svg>
      <div className="chart-tip" style={{ left: tipLeft, top: h[1] + 22 }}>
        <b>{data[hover].v} members</b><small>{prev >= 0 ? '+' : ''}{prev} this month</small>
      </div>
    </div>
  )
}

export default function Overview() {
  const { club } = useOutletContext()
  const { reqs, setReqs, clubEvents, membership, setMembership, notify } = useApp()
  const [misc, setMisc] = useState(null)
  const [range, setRange] = useState(6)
  const [modal, setModal] = useState(null)
  const [fee, setFee] = useState(membership.fee)

  useEffect(() => { api.getMisc().then(setMisc) }, [])

  const decide = (r, ok) => {
    setReqs(reqs.filter(x => x.id !== r.id))
    notify(ok ? `${r.name.split(' ')[0]} is now a member 🎉` : `Request from ${r.name.split(' ')[0]} declined`)
  }
  const upcoming = clubEvents.filter(e => e.status !== 'Cancelled').slice(0, 3)

  return (
    <>
      <div className="a-head">
        <div><h1>Overview</h1><p>Your club at a glance</p></div>
        <div className="a-head-actions">
          <button className="btn btn-grad" onClick={() => setModal('event')}><Plus size={18} /> Create event</button>
          <button className="btn btn-white" onClick={() => setModal('ann')}><Megaphone size={18} /> Post announcement</button>
        </div>
      </div>

      <div className="kpis">
        <div className="kpi"><span className="kpi-ic" style={{ background: '#efe8fd', color: '#9b6cf6' }}><Users size={22} strokeWidth={1.8} /></span>
          <div><span className="kpi-label">Members</span><span className="kpi-val">{club.members}</span><span className="kpi-sub up"><ArrowUp size={14} /> +6 this month</span></div></div>
        <div className="kpi"><span className="kpi-ic" style={{ background: '#e4ebff', color: '#5b7cf0' }}><Database size={22} strokeWidth={1.8} /></span>
          <div><span className="kpi-label">Revenue</span><span className="kpi-val">€690</span><span className="kpi-sub">One-time fees</span></div></div>
        <div className="kpi"><span className="kpi-ic" style={{ background: '#fde6f6', color: '#e05ad0' }}><Calendar size={22} strokeWidth={1.8} /></span>
          <div><span className="kpi-label">Upcoming events</span><span className="kpi-val">{clubEvents.filter(e => e.status !== 'Cancelled').length}</span><span className="kpi-sub">Next 30 days</span></div></div>
        <div className="kpi"><span className="kpi-ic" style={{ background: '#dff4fb', color: '#38a8d6' }}><ChartNoAxesColumn size={22} strokeWidth={1.8} /></span>
          <div><span className="kpi-label">Avg. attendance</span><span className="kpi-val">78%</span><span className="kpi-sub up"><ArrowUp size={14} /> +12% vs. last month</span></div></div>
      </div>

      <div className="a-row">
        <section className="a-card chart-card">
          <div className="a-card-head">
            <h2>Member growth <span>— last {range} months</span></h2>
            <label className="range-btn">
              <select value={range} onChange={e => setRange(+e.target.value)} aria-label="Period" style={{ border: 0, outline: 0, background: 'transparent', appearance: 'none', fontWeight: 600, cursor: 'pointer' }}>
                <option value={6}>Last 6 months</option><option value={12}>Last 12 months</option>
              </select><ChevronDown size={15} />
            </label>
          </div>
          {misc ? <Chart data={range === 6 ? misc.growth : misc.growth12} /> : <div className="skeleton" style={{ height: 170, marginTop: 10 }} />}
        </section>

        <section className="a-card">
          <div className="a-card-head"><h2>Join requests</h2><Link to="requests" className="see-all">See all <ArrowRight size={15} /></Link></div>
          <div className="req-list">
            {reqs.length === 0 && <p className="muted" style={{ fontSize: 14 }}>No pending request 🎉</p>}
            {reqs.slice(0, 3).map(r => (
              <div className="req" key={r.id}>
                <Avatar src={r.avatar} name={r.name} size={42} />
                <div className="req-who"><b>{r.name}</b><small>{r.school}</small></div>
                <button className="btn btn-grad" onClick={() => decide(r, true)}>Accept</button>
                <button className="btn-decline" onClick={() => decide(r, false)}>Decline</button>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="a-row" style={{ marginTop: 17 }}>
        <section className="a-card">
          <div className="a-card-head"><h2>Upcoming events</h2><Link to="events" className="see-all">See all <ArrowRight size={15} /></Link></div>
          <div className="scroll-x">
            <table className="ev-table">
              <thead><tr><th>Event</th><th>Date</th><th className="hide-sm">RSVPs</th><th className="hide-sm">Status</th><th /></tr></thead>
              <tbody>
                {upcoming.map(e => (
                  <tr key={e.id}>
                    <td><div className="ev-cell"><img src={e.img || '/img/ev-piano.jpg'} alt="" /><div><b>{e.title}</b><small><MapPin size={12} /> {e.place}</small></div></div></td>
                    <td className="ev-when"><b>{fmtDate(e.date)}</b><small>{e.start} – {e.end}</small></td>
                    <td className="rsvp hide-sm"><b>{e.rsvp} / {e.capacity}</b><div className="bar"><i style={{ width: `${(e.rsvp / e.capacity) * 100}%` }} /></div></td>
                    <td className="hide-sm"><span className={'status ' + e.status}>{e.status}</span></td>
                    <td style={{ textAlign: 'right', position: 'relative' }}><EventMenu ev={e} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="a-card">
          <div className="a-card-head"><h2>Membership</h2><button className="see-all" onClick={() => { setFee(membership.fee); setModal('fee') }}>Edit</button></div>
          <div className="mship">
            <div className="mship-row"><span className="mship-ic"><Tag size={19} strokeWidth={1.8} /></span><div><small>Join fee</small><b>{membership.fee > 0 ? `One-time · €${membership.fee}` : 'Free'}</b></div></div>
            <div className="mship-row"><span className="mship-ic"><Globe size={19} strokeWidth={1.8} /></span>
              <div style={{ flex: 1 }}><b style={{ fontWeight: 600 }}>{membership.public ? 'Public club' : 'Private club'}</b><p>{membership.public ? 'Visible to all students — anyone can send a join request.' : 'Hidden from search — invitation only.'}</p></div>
              <button className={'switch ' + (membership.public ? 'on' : '')} role="switch" aria-checked={membership.public} aria-label="Public club"
                onClick={() => { setMembership({ ...membership, public: !membership.public }); notify(membership.public ? 'Club is now private' : 'Club is now public') }} />
            </div>
          </div>
        </section>
      </div>

      {modal === 'event' && <EventModal onClose={() => setModal(null)} />}
      {modal === 'ann' && <AnnouncementModal onClose={() => setModal(null)} />}
      {modal === 'fee' && (
        <Modal title="Membership fee" sub="Students pay it once when they join." onClose={() => setModal(null)}
          actions={<><button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-grad" onClick={() => { setMembership({ ...membership, fee: Math.max(0, +fee || 0) }); setModal(null); notify('Membership updated') }}>Save</button></>}>
          <label className="label">One-time fee (€) — 0 for a free club</label>
          <label className="field"><Tag size={18} /><input type="number" min="0" max="200" value={fee} onChange={e => setFee(e.target.value)} /></label>
        </Modal>
      )}
    </>
  )
}
