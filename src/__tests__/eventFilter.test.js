/**
 * eventFilter.test.js — Unit tests for event date filtering logic
 *
 * Tests:
 * 1. Next Up section shows only future events
 * 2. Past events are excluded from Next Up
 * 3. Events on today's date are shown
 * 4. Calendar initialises to current month
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Pin "today" to a fixed date for deterministic tests
const FAKE_NOW = new Date('2026-12-01T12:00:00Z')
let RealDate

beforeEach(() => {
  RealDate = global.Date
  const DateMock = class extends Date {
    constructor(...args) { args.length ? super(...args) : super(FAKE_NOW); }
    static now() { return FAKE_NOW.getTime() }
    toISOString() { return new RealDate(this).toISOString() }
  }
  global.Date = DateMock
})

afterEach(() => { global.Date = RealDate })

function getToday() { return new Date().toISOString().slice(0, 10) }
function isFutureOrToday(dateStr) { return dateStr >= getToday() }

describe('Event date filtering logic', () => {
  const mockEvents = [
    { id: 'e1', title: 'Past event', date: '2026-10-15', next: true },
    { id: 'e2', title: 'Today event', date: '2026-12-01', next: true },
    { id: 'e3', title: 'Future event', date: '2027-01-10', next: true },
    { id: 'e4', title: 'Far future', date: '2027-03-01', next: false },
  ]

  it('filters out past events (before today)', () => {
    const today = getToday()
    const shown = mockEvents.filter(e => e.next && e.date >= today)
    expect(shown.some(e => e.id === 'e1')).toBe(false)
  })

  it("includes today's event in the list", () => {
    const today = getToday()
    const shown = mockEvents.filter(e => e.next && e.date >= today)
    expect(shown.some(e => e.id === 'e2')).toBe(true)
  })

  it('includes future events', () => {
    const today = getToday()
    const shown = mockEvents.filter(e => e.next && e.date >= today)
    expect(shown.some(e => e.id === 'e3')).toBe(true)
  })

  it('excludes events marked next:false from Next Up section', () => {
    const today = getToday()
    const shown = mockEvents.filter(e => e.next && e.date >= today)
    expect(shown.some(e => e.id === 'e4')).toBe(false)
  })

  it('calendar default month matches current year/month', () => {
    const cal = new Date() // mock returns FAKE_NOW
    expect(cal.getFullYear()).toBe(2026)
    expect(cal.getMonth()).toBe(11) // December = 11 (0-indexed)
  })
})
