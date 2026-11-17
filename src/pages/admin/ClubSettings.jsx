import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Type, MapPin, Tag, Navigation } from 'lucide-react'
import { useApp } from '../../context/AppContext'

const CATEGORIES = ['Music', 'Sport', 'Art', 'Tech', 'Gaming', 'Culture']

export default function ClubSettings() {
  const { club } = useOutletContext()
  const { membership, setMembership, clubProfile, setClubProfile, notify } = useApp()
  const [f, setF] = useState({
    name: club.name,
    city: club.city,
    category: club.category,
    description: club.description,
    ...(clubProfile || {})
  })
  const [radius, setRadius] = useState(membership.radius ?? 10)
  const set = k => e => setF({ ...f, [k]: e.target.value })
  const radiusPct = ((radius - 5) / 25) * 100

  function save(e) {
    e.preventDefault()
    if (f.name.trim().length < 2) return notify('Club name must be at least 2 characters')
    setClubProfile({ ...f, name: f.name.trim() })
    setMembership({ ...membership, radius: +radius })
    notify('Club settings saved ✓')
  }

  return (
    <>
      <div className="a-head"><div><h1>Club settings</h1><p>How students see your club</p></div></div>
      <form className="a-card a-section" onSubmit={save}>
        <div className="form-grid">
          <div className="full"><label className="label">Club name</label><label className="field"><Type size={18} /><input value={f.name} onChange={set('name')} required /></label></div>
          <div><label className="label">Neighbourhood</label><label className="field"><MapPin size={18} /><input value={f.city} onChange={set('city')} /></label></div>
          <div><label className="label">Category</label><label className="field"><Tag size={18} /><select value={f.category} onChange={set('category')}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></label></div>
          <div className="full"><label className="label">Description</label><label className="field area"><textarea value={f.description} onChange={set('description')} rows={4} /></label></div>

          {/* ── Location Radius ── */}
          <div className="full">
            <label className="label"><Navigation size={15} style={{ display: 'inline', marginRight: 6 }} />Location radius</label>
            <div className="radius" style={{ marginTop: 8 }}>
              <div className="radius-top"><span>Students within this radius can discover your club</span><b>{radius} km</b></div>
              <input type="range" min="5" max="30" step="1" value={radius}
                onChange={e => setRadius(e.target.value)}
                style={{ '--p': radiusPct + '%' }}
                aria-label="Club location radius in km" />
              <div className="radius-bot"><span>5 km</span><span>30 km max</span></div>
            </div>
          </div>

          {/* ── Visibility ── */}
          <div className="full" style={{ display: 'flex', alignItems: 'center', gap: 14, justifyContent: 'space-between' }}>
            <div>
              <b>Public club</b>
              <p className="muted" style={{ fontSize: 13 }}>
                {membership.public
                  ? 'Visible to all students — anyone can send a join request'
                  : 'Hidden from search — invitation only'}
              </p>
            </div>
            <button type="button" className={'switch ' + (membership.public ? 'on' : '')} role="switch"
              aria-checked={membership.public} aria-label="Toggle club visibility"
              onClick={() => {
                setMembership({ ...membership, public: !membership.public })
                notify(membership.public ? 'Club is now private' : 'Club is now public')
              }} />
          </div>
        </div>
        <div className="modal-actions"><button className="btn btn-grad">Save changes</button></div>
      </form>
    </>
  )
}
