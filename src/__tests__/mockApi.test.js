/**
 * mockApi.test.js — Unit tests for the mock API layer
 *
 * Tests:
 * 1. User registration creates a hashed record (no plaintext password)
 * 2. Login succeeds with correct credentials
 * 3. Login fails with wrong password
 * 4. Duplicate email is rejected on signup
 * 5. Invalid email is rejected on signup
 * 6. Short password is rejected on signup
 * 7. Admin login succeeds with correct credentials
 * 8. Admin login fails with wrong credentials
 * 9. Admin logout clears session
 * 10. Activity log records entries
 */

import { describe, it, expect } from 'vitest'
import {
  login,
  signup,
  adminLogin,
  adminLogout,
  isAdminAuthed,
  logActivity,
  getActivityLog,
} from '../api/mockApi'

describe('signup', () => {
  it('creates a user without storing the plaintext password', async () => {
    const user = await signup({ name: 'Alice Test', email: 'alice@test.fr', password: 'password123', school: 'ECE' })
    expect(user.name).toBe('Alice Test')
    expect(user.email).toBe('alice@test.fr')
    expect(user.passwordHash).toBeUndefined() // hash must NOT be returned
    expect(user.id).toMatch(/^u-/)
  })

  it('rejects an invalid email format', async () => {
    await expect(signup({ name: 'Bob', email: 'notanemail', password: 'pass123' })).rejects.toThrow('valid email')
  })

  it('rejects a password shorter than 6 characters', async () => {
    await expect(signup({ name: 'Bob', email: 'bob@test.fr', password: 'abc' })).rejects.toThrow('6 characters')
  })

  it('rejects a name shorter than 2 characters', async () => {
    await expect(signup({ name: 'B', email: 'b@test.fr', password: 'password123' })).rejects.toThrow('full name')
  })

  it('rejects duplicate email registration', async () => {
    await signup({ name: 'Carol', email: 'carol@test.fr', password: 'password123' })
    await expect(signup({ name: 'Carol2', email: 'carol@test.fr', password: 'other123' })).rejects.toThrow('already exists')
  })
})

describe('login', () => {
  it('succeeds with correct credentials', async () => {
    await signup({ name: 'Dave', email: 'dave@test.fr', password: 'mypassword' })
    const user = await login('dave@test.fr', 'mypassword')
    expect(user.email).toBe('dave@test.fr')
    expect(user.passwordHash).toBeUndefined() // hash never returned
  })

  it('is case-insensitive for email', async () => {
    await signup({ name: 'Eve', email: 'eve@test.fr', password: 'mypassword' })
    const user = await login('EVE@TEST.FR', 'mypassword')
    expect(user.name).toBe('Eve')
  })

  it('fails with wrong password', async () => {
    await signup({ name: 'Frank', email: 'frank@test.fr', password: 'correct' })
    await expect(login('frank@test.fr', 'wrong')).rejects.toThrow('Wrong password')
  })

  it('fails with unknown email', async () => {
    await expect(login('nobody@test.fr', 'password')).rejects.toThrow('No account')
  })
})

describe('adminLogin / adminLogout', () => {
  it('succeeds with correct admin credentials', () => {
    const ok = adminLogin('admin@tribu.fr', 'admin2026!')
    expect(ok).toBe(true)
    expect(isAdminAuthed()).toBe(true)
  })

  it('fails with wrong admin password', () => {
    const ok = adminLogin('admin@tribu.fr', 'wrongpassword')
    expect(ok).toBe(false)
  })

  it('fails with unknown admin email', () => {
    const ok = adminLogin('hacker@evil.com', 'admin2026!')
    expect(ok).toBe(false)
  })

  it('logout clears admin session', () => {
    adminLogin('admin@tribu.fr', 'admin2026!')
    expect(isAdminAuthed()).toBe(true)
    adminLogout()
    expect(isAdminAuthed()).toBe(false)
  })
})

describe('activity log', () => {
  it('records log entries and retrieves them in reverse chronological order', () => {
    logActivity({ type: 'registration', label: 'Alice joined tribu', userId: 'u-1' })
    logActivity({ type: 'membership', label: 'Alice joined Chess Club', userId: 'u-1' })
    const log = getActivityLog()
    expect(log.length).toBeGreaterThanOrEqual(2)
    expect(log[0].label).toBe('Alice joined Chess Club') // most recent first
    expect(log[0].ts).toBeDefined()
  })
})
