import { Link } from 'react-router-dom'
import { Background, Logo } from '../components/ui'

export default function NotFound() {
  return (
    <div className="page" style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
      <Background />
      <div className="panel glass" style={{ padding: 40, textAlign: 'center', maxWidth: 440 }}>
        <Logo size={30} />
        <h1 style={{ fontSize: 64, fontWeight: 800, letterSpacing: '-.04em', marginTop: 16 }}>404</h1>
        <p className="muted" style={{ margin: '6px 0 22px' }}>This page wandered off from its tribe.</p>
        <Link to="/" className="btn btn-grad">Go home</Link>
      </div>
    </div>
  )
}
