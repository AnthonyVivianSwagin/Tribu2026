/**
 * mockApi.js — Simulated backend for Tribu2026
 *
 * ACADEMIC NOTE: This module uses a simple djb2 hash for password storage.
 * This is NOT cryptographically secure and would never be used in production.
 * A real application must hash passwords server-side with bcrypt/argon2.
 * For this academic front-end demo, it prevents plaintext password storage in
 * localStorage while remaining dependency-free.
 */

import clubs from '../data/clubs.json'
import events from '../data/events.json'
import requests from '../data/requests.json'
import members from '../data/members.json'
import misc from '../data/misc.json'

const wait = (ms = 250) => new Promise(r => setTimeout(r, ms))
const copy = x => JSON.parse(JSON.stringify(x))

// ── Simple hash (djb2) — academic use only, NOT production-safe ──────────────
function hashPassword(str) {
  let h = 5381
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h) ^ str.charCodeAt(i)
  return (h >>> 0).toString(16)
}

// ── Users registry stored in localStorage ───────────────────────────────────
const REGISTRY_KEY = 'tribu-users-v2'

function loadRegistry() {
  try { return JSON.parse(localStorage.getItem(REGISTRY_KEY)) || {} } catch { return {} }
}

function saveRegistry(reg) {
  try { localStorage.setItem(REGISTRY_KEY, JSON.stringify(reg)) } catch {}
}

function ensureSeedAccounts() {
  const reg = loadRegistry()
  // Seed a demo student account if the registry is empty or missing it
  if (!reg['lea.martin@edu.ece.fr']) {
    reg['lea.martin@edu.ece.fr'] = {
      id: 'u-lea',
      name: 'Léa Martin',
      firstName: 'Léa',
      email: 'lea.martin@edu.ece.fr',
      passwordHash: hashPassword('tribu-2026!'),
      avatar: '/img/lea.jpg',
      school: 'ECE Paris',
      city: 'Paris',
      radius: 10,
      role: 'student',
      clubs: ['paris-piano', 'seine-runners', 'street-photo', 'chess-coffee'],
      leaderOf: ['paris-piano'],
      createdAt: '2026-02-03T10:00:00Z'
    }
    saveRegistry(reg)
  }
}

// Initialise on import
ensureSeedAccounts()

// ── Auth API ─────────────────────────────────────────────────────────────────

export async function login(email, password) {
  await wait(600)
  const reg = loadRegistry()
  const key = email.trim().toLowerCase()
  const u = reg[key]
  if (!u) throw new Error('No account found with this email')
  if (u.passwordHash !== hashPassword(password)) throw new Error('Wrong password')
  const { passwordHash: _, ...safe } = u // never return the hash to the UI
  return copy(safe)
}

export async function signup(form) {
  await wait(700)
  const email = form.email.trim().toLowerCase()
  if (!email.includes('@') || !email.includes('.')) throw new Error('Please enter a valid email address')
  if (form.password.length < 6) throw new Error('Password must be at least 6 characters')
  if (form.name.trim().length < 2) throw new Error('Please enter your full name')

  const reg = loadRegistry()
  if (reg[email]) throw new Error('An account with this email already exists')

  const id = 'u-' + Date.now()
  const firstName = form.name.trim().split(' ')[0]
  const record = {
    id,
    name: form.name.trim(),
    firstName,
    email,
    passwordHash: hashPassword(form.password),
    avatar: '',
    school: form.school || '',
    city: form.city || 'Paris',
    radius: form.radius || 10,
    role: 'student',
    clubs: [],
    leaderOf: [],
    createdAt: new Date().toISOString()
  }
  reg[email] = record
  saveRegistry(reg)

  // Log the registration activity
  logActivity({ type: 'registration', label: `${record.name} joined tribu`, userId: id })

  const { passwordHash: _, ...safe } = record
  return copy(safe)
}

// ── Activity log (used by admin dashboard) ───────────────────────────────────
const ACTIVITY_KEY = 'tribu-activity-v1'

export function logActivity(entry) {
  try {
    const log = JSON.parse(localStorage.getItem(ACTIVITY_KEY) || '[]')
    log.unshift({ ...entry, id: Date.now(), ts: new Date().toISOString() })
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(log.slice(0, 100)))
  } catch {}
}

export function getActivityLog() {
  try { return JSON.parse(localStorage.getItem(ACTIVITY_KEY) || '[]') } catch { return [] }
}

// ── Admin auth ────────────────────────────────────────────────────────────────
/**
 * ACADEMIC NOTE: Admin credentials are simulated front-end only.
 * In production, authentication must happen server-side. This check
 * provides UI-level gating only and can be bypassed by a knowledgeable user.
 */
const ADMIN_KEY = 'tribu-admin-session-v1'
const ADMIN_CREDENTIALS = { email: 'admin@tribu.fr', passwordHash: hashPassword('admin2026!') }

export function adminLogin(email, password) {
  if (email.trim().toLowerCase() !== ADMIN_CREDENTIALS.email) return false
  if (hashPassword(password) !== ADMIN_CREDENTIALS.passwordHash) return false
  try { sessionStorage.setItem(ADMIN_KEY, '1') } catch {}
  return true
}

export function adminLogout() {
  try { sessionStorage.removeItem(ADMIN_KEY) } catch {}
}

export function isAdminAuthed() {
  try { return sessionStorage.getItem(ADMIN_KEY) === '1' } catch { return false }
}

// ── Registry helpers for admin dashboard ─────────────────────────────────────
export function getAllUsers() {
  const reg = loadRegistry()
  return Object.values(reg).map(({ passwordHash: _, ...u }) => u)
}

// ── Mock data APIs ────────────────────────────────────────────────────────────
export async function getClubs() { await wait(); return copy(clubs) }
export async function getClub(id) {
  await wait(150)
  const c = clubs.find(c => c.id === id)
  return c ? copy(c) : null
}
export async function getEvents() { await wait(); return copy(events) }
export async function getRequests() { await wait(); return copy(requests) }
export async function getMembers() { await wait(); return copy(members) }
export async function getMisc() { await wait(100); return copy(misc) }
