import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { User, Mail, Lock, Eye, EyeOff, GraduationCap, MapPin, ChevronDown, Check, Shield, ArrowRight } from 'lucide-react'
import { Background, Logo, Modal } from '../components/ui'
import { useApp } from '../context/AppContext'
import * as api from '../api/mockApi'
import './auth.css'

const SCHOOLS = ['ECE Paris', 'Sorbonne Université', 'Sciences Po Paris', 'Université Paris Cité', 'EPITA', 'Dauphine']
const CITIES = ['Paris', 'Lyon', 'Lille', 'Bordeaux', 'Marseille']

function Google() {
  return (
    <svg width="22" height="22" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  )
}

export default function Auth({ mode }) {
  const isLogin = mode === 'login'
  const nav = useNavigate()
  const loc = useLocation()
  const { setUser, notify } = useApp()
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [forgot, setForgot] = useState(false)
  const [f, setF] = useState({ name: '', email: '', password: '', school: '', city: 'Paris', radius: 10, remember: true })
  const set = k => e => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })

  async function submit(e) {
    e.preventDefault()
    setErr('')
    if (!isLogin && f.name.trim().length < 2) return setErr('Please enter your full name')
    setBusy(true)
    try {
      const u = isLogin ? await api.login(f.email, f.password) : await api.signup(f)
      setUser(u)
      notify(isLogin ? `Welcome back, ${u.firstName}!` : 'Account created, welcome to tribu 🎉')
      nav(loc.state?.from || '/home')
    } catch (x) { setErr(x.message) }
    setBusy(false)
  }

  const pct = ((f.radius - 5) / 25) * 100

  return (
    <div className="auth-page">
      <Background variant="auth" />
      <main className={'auth-card glass ' + (isLogin ? 'is-login' : '')}>
        <section className="auth-visual">
          <img src="/img/hero-knot.jpg" alt="" />
          <div className="auth-visual-text">
            <h2>Find your tribe,<br />near you.</h2>
            <p>Join student clubs around you — music, sport,<br />art, tech and more.</p>
          </div>
        </section>

        <section className="auth-form">
          <Link to="/" aria-label="tribu home"><Logo size={30} /></Link>
          <div className="auth-tabs" role="tablist">
            <span className={'auth-tab-bg ' + (isLogin ? 'right' : '')} />
            <Link role="tab" aria-selected={!isLogin} to="/signup" className={!isLogin ? 'on' : ''}>Sign up</Link>
            <Link role="tab" aria-selected={isLogin} to="/login" className={isLogin ? 'on' : ''}>Log in</Link>
          </div>

          <h1>{isLogin ? 'Welcome back' : 'Create your account'}</h1>
          <p className="auth-sub">{isLogin ? 'Log in to see what your clubs are up to.' : 'It takes less than a minute.'}</p>

          <form onSubmit={submit} className="auth-fields" noValidate>
            {!isLogin && (
              <label className="field"><User size={18} /><input placeholder="Full name" value={f.name} onChange={set('name')} autoComplete="name" aria-label="Full name" /></label>
            )}
            <label className="field"><Mail size={18} /><input type="email" placeholder="you@example.com" value={f.email} onChange={set('email')} autoComplete="email" aria-label="Email" /></label>
            <label className="field">
              <Lock size={18} />
              <input type={show ? 'text' : 'password'} placeholder="Password" value={f.password} onChange={set('password')} autoComplete={isLogin ? 'current-password' : 'new-password'} aria-label="Password" />
              <button type="button" className="eye" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button>
            </label>

            {!isLogin && <>
              <label className="field select">
                <GraduationCap size={18} />
                <select value={f.school} onChange={set('school')} className={f.school ? '' : 'placeholder'} aria-label="School">
                  <option value="">School (optional) — e.g. ECE Paris</option>
                  {SCHOOLS.map(s => <option key={s}>{s}</option>)}
                </select>
                <ChevronDown size={18} />
              </label>
              <label className="field select">
                <MapPin size={18} />
                <select value={f.city} onChange={set('city')} aria-label="City">{CITIES.map(c => <option key={c}>{c}</option>)}</select>
                <ChevronDown size={18} />
              </label>
              <div className="radius">
                <div className="radius-top"><span>Search radius</span><b>{f.radius} km</b></div>
                <input type="range" min="5" max="30" step="1" value={f.radius} onChange={set('radius')} style={{ '--p': pct + '%' }} aria-label="Search radius in km" />
                <div className="radius-bot"><span>5 km</span><span>30 km max</span></div>
              </div>
            </>}

            {isLogin && (
              <div className="remember">
                <label><input type="checkbox" checked={f.remember} onChange={set('remember')} /><span className="cb">{f.remember && <Check size={13} strokeWidth={3} />}</span>Remember me</label>
                <button type="button" onClick={() => setForgot(true)}>Forgot password?</button>
              </div>
            )}

            {err && <p className="form-error" role="alert">{err}</p>}
            <button className="btn btn-grad auth-submit" disabled={busy}>{busy ? 'Please wait…' : isLogin ? 'Log in' : 'Create account'}</button>
          </form>

          <div className="or"><span>or continue with</span></div>
          <button className="btn btn-white auth-google" onClick={() => notify('Google sign-in is simulated in this demo — use the email form')}><Google /> Continue with Google</button>

          {isLogin ? <>
            <p className="auth-foot">New to tribu? <Link to="/signup">Create an account</Link></p>
            <Link to="/admin-console" className="admin-link"><Shield size={15} /> Platform admin? Open the admin console <ArrowRight size={14} /></Link>
          </> : <p className="auth-foot">Already have an account? <Link to="/login">Log in</Link></p>}
        </section>
      </main>

      {forgot && (
        <Modal title="Reset your password" sub="We'll send you a link to choose a new one." onClose={() => setForgot(false)}
          actions={<><button className="btn btn-ghost" onClick={() => setForgot(false)}>Cancel</button>
            <button className="btn btn-grad" onClick={() => { setForgot(false); notify('Reset link sent to ' + (f.email || 'your email')) }}>Send link</button></>}>
          <label className="field"><Mail size={18} /><input type="email" value={f.email} onChange={set('email')} placeholder="you@example.com" aria-label="Email" /></label>
        </Modal>
      )}
    </div>
  )
}
