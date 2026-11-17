# Academic Report — Tribu 2026
## Front-End Development

---

## 1. Project Overview

**Tribu** is a student club discovery and management platform.  
It allows students to search for clubs, send membership requests, and RSVP to events. Club leaders manage their members, events, and announcements from a dedicated dashboard. A platform administration console provides global oversight.

---

## 2. Functional Specifications Coverage

### 2.1 Authentication & User Isolation

| Requirement | Implementation |
|---|---|
| Registration with email + password | `mockApi.signup()` — validates email format, password ≥ 6 chars, name ≥ 2 chars |
| Secure login | `mockApi.login()` — djb2 hash comparison, case-insensitive email |
| Data isolated per user | localStorage key `tribu-state-v2-{userId}` — each account is fully independent |
| Logout | `AppContext.logout()` — resets React state, logs activity |
| No pre-filled credentials | Form fields are empty by default — users enter their own credentials |

**Academic security note:**  
Passwords are hashed with the djb2 algorithm before being stored in localStorage. This avoids plaintext storage and is appropriate for an academic front-end demo. In production, hashing must happen server-side (bcrypt/argon2) and passwords must never be sent to the client.

### 2.2 Club Discovery & Membership

| Requirement | Implementation |
|---|---|
| Suggested clubs ≠ already-joined clubs | Dynamic filter: `!user.clubs?.includes(c.id)` |
| Public/private visibility respected | Filter: `c.public !== false` on suggested clubs |
| Join a free public club | Direct membership → updates `user.clubs` |
| Join a paid club | Simulated payment modal → `confirm()` after checkout |
| Join a private club | Sends a membership request → `pending` state |
| Cancel a request | Removes from `reqs` and resets `joined` status |
| Request visible to club leader | `JoinButton` appends the request to shared `reqs` state |

### 2.3 Events

| Requirement | Implementation |
|---|---|
| Future event dates | JSON data updated: December 2026 / January 2027 |
| "Next Up" shows only upcoming events | Filter: `e.date >= today` |
| Personal calendar opens at current month | `useState(new Date())` — no hardcoded date |
| New events must be in the future | Validation: `f.date < TODAY` in `EventModal` |
| Default date for new events: +2 weeks | `Date.now() + 14 * 86400000` |

### 2.4 Club Leader Dashboard

| Page | Features |
|---|---|
| **Overview** | Member, event, and announcement KPIs; growth chart |
| **Members** | List with role filters; promote to co-leader; remove member |
| **Join Requests** | Accept / Decline individually or in bulk; decision history |
| **Events** | Create, edit, publish, unpublish, cancel; future date enforced |
| **Announcements** | Post → creates announcement + unread notification for all members |
| **Settings** | Name, description, category, geographic radius (5–30 km), visibility toggle |
| **Payouts** | Table of received payments |

### 2.5 Platform Administration Console

Access to `/admin-console` is protected by a dedicated login form (`admin@tribu.fr`, stored in `sessionStorage`).

> **Academic note:** This is a front-end only protection. It provides a UI-level gate but can be bypassed with browser developer tools. In production, this must be enforced server-side with role-based access control (RBAC) and JWT tokens.

| Admin Page | Content |
|---|---|
| **Dashboard** | Live KPIs: users, clubs, pending requests, upcoming events, announcements, activity |
| **Users** | Table of all registered accounts with role filter |
| **Clubs** | Full directory, category/search filters, Suspend/Reactivate actions |
| **Memberships** | All requests (pending / accepted / rejected) with actions |
| **Events** | All platform events (upcoming / past / cancelled) |
| **Activity** | Chronological audit log (registration, membership, announcements…) |

---

## 3. Technical Architecture

### 3.1 Technology Stack

| Layer | Technology | Justification |
|---|---|---|
| UI Framework | React 19 | Reusable components, Hooks, performance |
| Bundler | Vite 8 | Ultra-fast builds, instant HMR |
| Routing | React Router v7 | Declarative navigation, protected routes |
| Icons | Lucide React | Consistent SVG library, tree-shaking |
| Font | Plus Jakarta Sans | High legibility, modern feel |
| Styling | Vanilla CSS | Full control, no external dependency |
| State | React Context + localStorage | Lightweight persistence, per-user isolation |
| Testing | Vitest + jsdom | Fast unit tests, Vite-compatible |

### 3.2 State Management

```
AppContext (React Context)
├── user               — logged-in user profile
├── joined             — membership statuses {clubId: 'member'|'pending'}
├── rsvps              — event RSVPs
├── notifs             — notifications (read/unread)
├── clubEvents         — events for the managed club
├── reqs               — membership requests
├── announcements      — posted announcements
├── membership         — club config (radius, visibility, fee)
└── clubProfile        — edited club profile
```

**Per-user isolation:** On login, `setUser(u)` loads from `localStorage.getItem('tribu-state-v2-{u.id}')`. On logout, state is reset to defaults. One user's data is never visible to another.

### 3.3 Authentication Flow

```
Signup                          Login
  │                               │
  ├─ Validate email/password       ├─ Look up email in registry
  ├─ Check email uniqueness        ├─ Compare hash(password)
  ├─ Hash password (djb2)          ├─ Return profile without hash
  ├─ Save to registry              └─ setUser() → load user state
  ├─ Log activity
  └─ setUser() → load user state
```

### 3.4 File Structure

```
src/
├── api/mockApi.js              # Auth, registry, admin, activity log
├── components/
│   ├── JoinButton.jsx          # Membership flow (direct / payment / request)
│   ├── TopBar.jsx              # Navigation + notifications
│   └── ui.jsx                  # Modal, Toast, Avatar, Logo…
├── context/AppContext.jsx       # Global state + localStorage persistence
├── data/                       # Static JSON (clubs, events, members…)
├── pages/
│   ├── admin/                  # Leader pages (Overview, Members, Events…)
│   ├── admin-console/          # Platform admin pages (Dashboard, Users…)
│   ├── AdminConsole.jsx        # Admin shell + login guard
│   ├── Auth.jsx                # Login / Register
│   ├── ClubPage.jsx            # Club detail
│   ├── Home.jsx                # Club discovery + Next Up
│   └── MyEvents.jsx            # Personal calendar
└── __tests__/
    ├── setup.js
    ├── mockApi.test.js         # 14 auth tests
    ├── eventFilter.test.js     # 5 date filter tests
    └── joinButton.test.js      # 8 join state machine tests
```

---

## 4. Responsive Design

The application is fully responsive across 3 breakpoints:

| Breakpoint | Behaviour |
|---|---|
| ≥ 1024 px | Fixed sidebar, 4-column KPI grid, full tables |
| 768–1023 px | Hidden sidebar (burger menu), 2-column KPI grid |
| < 768 px | `hide-sm` table columns hidden, vertical layout |

Techniques: CSS Grid with `auto-fit / minmax`, `position: sticky` for the sidebar, media queries without any external framework.

---

## 5. Automated Tests

### Results

```
 ✓ src/__tests__/eventFilter.test.js   (5 tests)   5ms
 ✓ src/__tests__/joinButton.test.js    (8 tests)   5ms
 ✓ src/__tests__/mockApi.test.js       (14 tests)  8815ms

 Test Files  3 passed (3)
      Tests  27 passed (27)
   Duration  10.18s
```

### Coverage breakdown

| File | Tests | What is tested |
|---|---|---|
| `mockApi.test.js` | 14 | Signup (5), Login (4), Admin auth (4), Activity log (1) |
| `eventFilter.test.js` | 5 | Past / today / future events, `next:false`, calendar month |
| `joinButton.test.js` | 8 | Status detection (4), direct / payment / request / cancel flows (4) |

### Testing strategy

Tests are **pure unit tests** — they test business logic without any React dependency (no DOM rendering for `mockApi` and `joinButton`). `Date` mocking ensures deterministic date-filter tests.

---

## 6. Issues Identified and Fixed

| # | Original problem | Fix applied |
|---|---|---|
| 1 | `npm install` text concatenated onto the DOCTYPE in `index.html` | Removed spurious text |
| 2 | All event dates were in October 2026 (past) | Updated to December 2026 / January 2027 |
| 3 | Auth form pre-filled with Léa's credentials | Fields empty by default |
| 4 | Single hardcoded user, no real auth | Multi-account registry with djb2 hashing |
| 5 | All accounts shared `tribu-state-v1` | Per-user key `tribu-state-v2-{id}` |
| 6 | Calendar hardcoded to October 2026 | `useState(new Date())` |
| 7 | "Next Up" showed past events | Filter `e.date >= today` |
| 8 | Suggested clubs: whitelist of 6 fixed IDs | Dynamic filter on `user.clubs` |
| 9 | Geographic radius slider was display-only | Persisted to `membership.radius` |
| 10 | Announcements created no notification | `postAnnouncement()` creates both |
| 11 | Join requests not visible to club leader | `JoinButton` appends to shared `reqs` |
| 12 | Cancel request was broken | Removes from `reqs` + resets `joined` |
| 13 | Admin console had no login protection | Login form + `sessionStorage` guard |
| 14 | Admin console had no content | KPI dashboard + 5 fully functional sub-pages |
| 15 | `AdminLayout` imported deleted `leader` export | Replaced with `user` from context |

---

## 7. Notable Design Decisions

### No real backend
The application is 100% client-side. `mockApi.js` simulates network delays (`setTimeout`) and reads static JSON files. This architecture demonstrates the entire front-end logic without requiring any external infrastructure.

### Vanilla CSS
Choosing not to use Tailwind or Bootstrap provides full control over the design system and demonstrates mastery of native CSS (Custom Properties, Grid, Flexbox, `backdrop-filter`, animations, media queries).

### Glassmorphism
The "frosted glass" aesthetic (`backdrop-filter: blur`, semi-transparent backgrounds) is implemented via the `.glass` class applied to cards, sidebars, and the top bar, for a consistent modern look.

### Accessibility
- `aria-label` on all icon-only buttons
- `role="alert"` on error messages
- `aria-pressed` on toggle buttons
- `aria-expanded` on dropdown menus
- Visible keyboard focus on all interactive elements

---

## 8. Acknowledged Academic Limitations

| Limitation | Explanation |
|---|---|
| djb2 hashing | Not cryptographically secure. Used only to avoid plaintext storage in localStorage. Production must use bcrypt/argon2 server-side. |
| Front-end admin auth | UI-level protection only. Production requires server-side RBAC + JWT. |
| No real backend | All data is simulated client-side. |
| localStorage | No cross-tab synchronisation, limited to ~5 MB per origin. |
| Test coverage | Unit tests only (pure logic). Integration and E2E tests not included. |

---

