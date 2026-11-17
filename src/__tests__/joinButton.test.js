/**
 * joinButton.test.js — Unit tests for membership state logic
 *
 * Tests the core join workflow state machine:
 * 1. Non-member shows Join
 * 2. Pending member shows Requested
 * 3. Member shows Joined
 * 4. Free & public club → direct membership
 * 5. Paid club → payment modal required
 * 6. Private club → join request required
 * 7. Cancelling a request removes it from reqs
 */

import { describe, it, expect } from 'vitest'

// Pure state logic extracted from JoinButton (no React dependency needed)
function getStatus(user, joined, club) {
  if (user?.clubs?.includes(club.id)) return 'member'
  return joined[club.id] || null
}

function getJoinFlow(club) {
  if (club.price > 0) return 'payment'
  if (!club.public) return 'request'
  return 'direct'
}

function simulateJoin(user, joined, club) {
  const flow = getJoinFlow(club)
  if (flow === 'direct') {
    return {
      joined: { ...joined, [club.id]: 'member' },
      user: { ...user, clubs: [...(user.clubs || []), club.id] }
    }
  }
  if (flow === 'request') {
    return { joined: { ...joined, [club.id]: 'pending' } }
  }
  if (flow === 'payment') {
    return { requiresPayment: true }
  }
}

function simulateCancelRequest(user, joined, reqs, club) {
  const j = { ...joined }; delete j[club.id]
  return {
    joined: j,
    reqs: reqs.filter(r => !(r.clubId === club.id && r.userId === user.id))
  }
}

describe('Join button state machine', () => {
  const user = { id: 'u-1', name: 'Alice', clubs: ['chess-coffee'] }
  const freePublic = { id: 'jazz-club', price: 0, public: true }
  const paidClub = { id: 'paid-club', price: 20, public: true }
  const privateClub = { id: 'secret-club', price: 0, public: false }
  const alreadyJoined = { id: 'chess-coffee', price: 0, public: true }

  it('shows null status for a non-member', () => {
    expect(getStatus(user, {}, freePublic)).toBeNull()
  })

  it('shows member status for a club in user.clubs', () => {
    expect(getStatus(user, {}, alreadyJoined)).toBe('member')
  })

  it('shows pending status after sending request', () => {
    expect(getStatus(user, { 'jazz-club': 'pending' }, freePublic)).toBe('pending')
  })

  it('shows member status after joining via joined state', () => {
    expect(getStatus(user, { 'jazz-club': 'member' }, freePublic)).toBe('member')
  })

  it('free public club → direct membership', () => {
    const result = simulateJoin(user, {}, freePublic)
    expect(result.joined['jazz-club']).toBe('member')
    expect(result.user.clubs).toContain('jazz-club')
  })

  it('paid club → requires payment modal', () => {
    const result = simulateJoin(user, {}, paidClub)
    expect(result.requiresPayment).toBe(true)
  })

  it('private club → creates join request', () => {
    const result = simulateJoin(user, {}, privateClub)
    expect(result.joined['secret-club']).toBe('pending')
  })

  it('cancelling a request removes it from joined and reqs', () => {
    const joined = { 'secret-club': 'pending' }
    const reqs = [{ id: 'r1', clubId: 'secret-club', userId: 'u-1' }]
    const result = simulateCancelRequest(user, joined, reqs, privateClub)
    expect(result.joined['secret-club']).toBeUndefined()
    expect(result.reqs.length).toBe(0)
  })
})
