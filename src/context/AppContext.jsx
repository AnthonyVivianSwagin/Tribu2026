import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import misc from '../data/misc.json'
import events from '../data/events.json'
import requests from '../data/requests.json'
import { logActivity } from '../api/mockApi'

const Ctx = createContext(null)

// Per-user state key — isolates each account's data completely
const userKey = userId => `tribu-state-v2-${userId || 'guest'}`

function load(userId) {
  try { return JSON.parse(localStorage.getItem(userKey(userId))) || {} } catch { return {} }
}

// Default "next up" events filter to future-only
const TODAY = new Date().toISOString().slice(0, 10)
const DEFAULT_EVENTS = events.filter(e => !e.next && e.rsvp != null && e.date >= TODAY)

export function AppProvider({ children }) {
  // user is loaded from the guest key first; on login we reload for that user
  const [user, setUserState] = useState(() => {
    try { const s = JSON.parse(localStorage.getItem(userKey('guest'))); return s?.user || null } catch { return null }
  })

  const [saved, setSaved] = useState(() => load(user?.id))

  // Per-user state
  const [joined, setJoined] = useState(() => saved.joined || {})
  const [rsvps, setRsvps] = useState(() => saved.rsvps || {})
  const [notifs, setNotifs] = useState(() => saved.notifs || misc.notifications)
  const [clubEvents, setClubEvents] = useState(() => saved.clubEvents || DEFAULT_EVENTS)
  const [reqs, setReqs] = useState(() => saved.reqs || requests)
  const [announcements, setAnnouncements] = useState(() => saved.announcements || misc.announcements)
  const [membership, setMembership] = useState(() => saved.membership || { fee: 15, public: true, radius: 10 })
  const [clubProfile, setClubProfile] = useState(() => saved.clubProfile || {})
  const [toast, setToast] = useState(null)

  // Reload per-user state when user changes (login/logout)
  function setUser(u) {
    setUserState(u)
    if (u) {
      const s = load(u.id)
      setJoined(s.joined || {})
      setRsvps(s.rsvps || {})
      setNotifs(s.notifs || misc.notifications)
      setClubEvents(s.clubEvents || DEFAULT_EVENTS)
      setReqs(s.reqs || requests)
      setAnnouncements(s.announcements || misc.announcements)
      setMembership(s.membership || { fee: 15, public: true, radius: 10 })
      setClubProfile(s.clubProfile || {})
    } else {
      // Clear on logout
      setJoined({})
      setRsvps({})
      setNotifs(misc.notifications)
      setClubEvents(DEFAULT_EVENTS)
      setReqs(requests)
      setAnnouncements(misc.announcements)
      setMembership({ fee: 15, public: true, radius: 10 })
      setClubProfile({})
    }
  }

  // Persist state keyed by user ID
  useEffect(() => {
    if (!user) return
    try {
      localStorage.setItem(userKey(user.id), JSON.stringify({
        user, joined, rsvps, notifs, clubEvents, reqs, announcements, membership, clubProfile
      }))
    } catch { /* private mode — state lives in memory only */ }
  }, [user, joined, rsvps, notifs, clubEvents, reqs, announcements, membership, clubProfile])

  const notify = useCallback((msg, type = 'ok') => {
    setToast({ msg, type, id: Date.now() })
    setTimeout(() => setToast(t => (t && Date.now() - t.id > 2500 ? null : t)), 2700)
  }, [])

  const logout = () => {
    logActivity({ type: 'logout', label: `${user?.name || 'User'} logged out`, userId: user?.id })
    setUser(null)
  }

  const resetDemo = () => { try { localStorage.clear() } catch {} location.href = '/' }

  // Post announcement and also create a notification for all members
  const postAnnouncement = useCallback((title, body) => {
    const ann = { id: 'a' + Date.now(), title, body, date: new Date().toISOString().slice(0, 10), audience: 'All members', readBy: [] }
    setAnnouncements(prev => [ann, ...prev])
    const notif = { id: 'no' + Date.now(), text: `New announcement: ${title}`, time: 'just now', unread: true, annId: ann.id }
    setNotifs(prev => [notif, ...prev])
    logActivity({ type: 'announcement', label: `Announcement posted: "${title}"`, userId: user?.id })
    notify('Announcement posted to all members')
  }, [user, notify])

  // Mark notification as read
  const markRead = useCallback(id => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n))
  }, [])

  // Mark all notifications as read
  const markAllRead = useCallback(() => {
    setNotifs(prev => prev.map(n => ({ ...n, unread: false })))
  }, [])

  return (
    <Ctx.Provider value={{
      user, setUser, logout,
      joined, setJoined,
      rsvps, setRsvps,
      notifs, setNotifs, markRead, markAllRead,
      clubEvents, setClubEvents,
      reqs, setReqs,
      announcements, setAnnouncements, postAnnouncement,
      membership, setMembership,
      clubProfile, setClubProfile,
      toast, notify,
      resetDemo
    }}>
      {children}
    </Ctx.Provider>
  )
}

export const useApp = () => useContext(Ctx)
