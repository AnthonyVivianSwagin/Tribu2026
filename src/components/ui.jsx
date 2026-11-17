import { useEffect, useId } from 'react'
import { createPortal } from 'react-dom'
import { X, CircleCheck, Info, Piano, Activity, Camera, Coffee, Mountain, Music, Gamepad2, Heart, Palette, MessageCircle, Circle } from 'lucide-react'

// only the icons used by clubs, so the bundle stays small
const Icons = { Piano, Activity, Camera, Coffee, Mountain, Music, Gamepad2, Heart, Palette, MessageCircle, Circle }
import { useApp } from '../context/AppContext'

export function Logo({ size = 30 }) {
  // three overlapping bubbles = the "tribe"
  const s = size * 1.2
  const id = useId().replace(/:/g, '')
  return (
    <span className="logo" style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.33 }}>
      <svg width={s} height={s} viewBox="0 0 36 36" aria-hidden="true">
        <defs>
          <linearGradient id={id + "lg1"} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f39ad9" /><stop offset="1" stopColor="#e478d6" /></linearGradient>
          <linearGradient id={id + "lg2"} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#9b6bff" /><stop offset="1" stopColor="#7c4df2" /></linearGradient>
          <linearGradient id={id + "lg3"} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#b67cf7" /><stop offset="1" stopColor="#9d5ff0" /></linearGradient>
        </defs>
        <circle cx="18" cy="10.5" r="9" fill={`url(#${id}lg1)`} />
        <circle cx="10.5" cy="25" r="9.5" fill={`url(#${id}lg2)`} opacity=".95" />
        <circle cx="25.5" cy="25" r="9.5" fill={`url(#${id}lg3)`} opacity=".9" />
      </svg>
      <span style={{ fontSize: size * 1.07, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 }}>tribu</span>
    </span>
  )
}

const BUBBLES = {
  auth: [[-90, 40, 300], [640, -120, 240], [1260, 90, 260], [40, 700, 220], [1180, 650, 260]],
  home: [[-120, -60, 330], [640, -160, 240], [1260, 90, 300], [-60, 760, 220], [1200, 740, 300]],
  admin: [[-100, -80, 300], [640, -150, 240], [1280, 120, 260], [20, 780, 220], [1200, 760, 280]],
}

export function Background({ variant = 'home' }) {
  return (
    <div className="bg" aria-hidden="true">
      {BUBBLES[variant].map(([x, y, d], i) => (
        <span key={i} className="bubble" style={{ left: `${(x / 1440) * 100}%`, top: y, width: d, height: d }} />
      ))}
    </div>
  )
}

export function Icon({ name, size = 18, ...p }) {
  const C = Icons[name] || Icons.Circle
  return <C size={size} strokeWidth={1.8} {...p} />
}

const CLUB_ICON_BG = { 'paris-piano': '#14111f', 'seine-runners': '#b39af7', 'street-photo': '#14111f', 'chess-coffee': '#7b4a2d' }
export function ClubIcon({ club, size = 44 }) {
  return (
    <span className="club-icon" style={{ width: size, height: size, background: CLUB_ICON_BG[club.id] || '#8b5cf6' }}>
      <Icon name={club.icon} size={size * 0.45} color="#fff" />
    </span>
  )
}

export function Avatar({ src, name = '', size = 40, ring }) {
  if (src) return <img className="avatar" src={src} alt={name} width={size} height={size} style={{ width: size, height: size, boxShadow: ring ? '0 0 0 3px #fff' : undefined }} />
  const ini = name.split(' ').map(w => w[0]).join('').slice(0, 2)
  return <span className="avatar avatar-fallback" style={{ width: size, height: size, fontSize: size * 0.36 }}>{ini}</span>
}

export function Modal({ title, sub, onClose, children, actions, wide }) {
  useEffect(() => {
    const k = e => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onClose])
  // portal to body: a modal opened from inside a card link must not be a child of that link.
  // react still bubbles events through the tree, so we stop them here too
  return createPortal(
    <div className="modal-back" onClick={e => e.stopPropagation()} onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title} style={wide ? { maxWidth: 680 } : undefined}>
        <div className="modal-head">
          <div><h3>{title}</h3>{sub && <p className="muted" style={{ fontSize: 14 }}>{sub}</p>}</div>
          <button className="close-x" onClick={onClose} aria-label="Close"><X size={16} /></button>
        </div>
        {children}
        {actions && <div className="modal-actions">{actions}</div>}
      </div>
    </div>,
    document.body
  )
}

export function Toast() {
  const { toast } = useApp()
  if (!toast) return null
  return (
    <div className={'toast ' + (toast.type === 'err' ? 'err' : '')} role="status" key={toast.id}>
      {toast.type === 'err' ? <Info size={16} /> : <CircleCheck size={16} />} {toast.msg}
    </div>
  )
}

export const fmtDay = d => new Date(d + 'T12:00').toLocaleDateString('en-GB', { weekday: 'short' })
export const fmtDate = d => new Date(d + 'T12:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
