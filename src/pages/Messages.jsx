import { useEffect, useRef, useState } from 'react'
import { Send, ArrowLeft } from 'lucide-react'
import TopBar from '../components/TopBar'
import { Background, Avatar } from '../components/ui'
import { useApp } from '../context/AppContext'
import * as api from '../api/mockApi'
import './messages.css'

export default function Messages({ embedded }) {
  const { user } = useApp()
  const [convs, setConvs] = useState([])
  const [cur, setCur] = useState(null)
  const [text, setText] = useState('')
  const end = useRef(null)

  useEffect(() => { api.getMisc().then(m => { setConvs(m.conversations); if (window.innerWidth > 720) setCur(m.conversations[0].id) }) }, [])
  useEffect(() => { end.current?.scrollIntoView({ block: 'end' }) }, [cur, convs])

  const c = convs.find(x => x.id === cur)
  function send(e) {
    e.preventDefault()
    if (!text.trim()) return
    const now = new Date().toTimeString().slice(0, 5)
    setConvs(convs.map(x => x.id === cur ? { ...x, last: 'You: ' + text, time: now, messages: [...x.messages, { from: 'me', text, time: now }] } : x))
    setText('')
  }

  const box = (
    <div className={'msg-wrap panel glass ' + (cur ? 'has-cur' : '')}>
      <div className="msg-list">
        <h2>Messages</h2>
        {convs.map(x => (
          <button key={x.id} className={'conv ' + (x.id === cur ? 'on' : '')} onClick={() => setCur(x.id)}>
            <img src={`/img/club-${{ c1: 'piano', c2: 'runners', c3: 'photo' }[x.id]}.jpg`} alt="" />
            <span><b>{x.name}</b><small>{x.last}</small></span><time>{x.time}</time>
          </button>
        ))}
      </div>
      <div className="msg-thread">
        {c ? <>
          <div className="thread-head"><button className="thread-back" onClick={() => setCur(null)} aria-label="Back to conversations"><ArrowLeft size={18} /></button><b>{c.name}</b><small className="muted">{c.messages.length} messages</small></div>
          <div className="thread-body">
            {c.messages.map((mm, i) => (
              <div key={i} className={'bubble-msg ' + (mm.from === 'me' ? 'me' : '')}>
                {mm.from !== 'me' && <Avatar name={mm.from} src={mm.from === 'Camille R.' ? '/img/camille.jpg' : ''} size={32} />}
                <div><small>{mm.from === 'me' ? user.firstName : mm.from} · {mm.time}</small><p>{mm.text}</p></div>
              </div>
            ))}
            <span ref={end} />
          </div>
          <form className="thread-input" onSubmit={send}>
            <input value={text} onChange={e => setText(e.target.value)} placeholder="Write a message…" aria-label="Message" />
            <button className="btn btn-grad" aria-label="Send"><Send size={17} /></button>
          </form>
        </> : <p className="muted" style={{ margin: 'auto' }}>Pick a conversation</p>}
      </div>
    </div>
  )

  if (embedded) return <div className="admin-pad">{box}</div>
  return <div className="page"><Background /><TopBar /><div style={{ marginTop: 24 }}>{box}</div></div>
}
