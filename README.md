# Tribu 2026 — Front-End Application

**Tribu** is a student club discovery and management platform for ECE Paris and partner schools.  
Built with **React 19 + Vite + React Router v7**, deployed as a fully client-side SPA.

---

## 🚀 Quick start

```bash
cd tribu
npm install
npm run dev      # http://localhost:5173
```

### Demo accounts

| Account | Email | Password | Role |
|---|---|---|---|
| Léa Martin *(pre-seeded)* | `lea.martin@edu.ece.fr` | `tribu-2026!` | Student · Club leader |
| Any new user | Register at `/signup` | Your choice | Student |
| Platform admin | `admin@tribu.fr` | `admin2026!` | Admin console |

> **Note — user isolation:** Every registered account has completely independent state (joined clubs, RSVPs, announcements). Create two accounts and log in alternately to verify.

---

## 📋 Available scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server (`localhost:5173`) |
| `npm run build` | Production bundle (`dist/`) |
| `npm run preview` | Preview production bundle |
| `npm test` | Run all 27 automated unit tests |

---

## 🗺️ Application routes

| Route | Description | Auth required |
|---|---|---|
| `/` | Redirect → `/login` | — |
| `/login` | Sign in / sign up | — |
| `/home` | Club discovery + Next Up events | ✅ |
| `/clubs/:id` | Club detail + events + members | ✅ |
| `/my-events` | Personal calendar | ✅ |
| `/messages` | Messaging (UI) | ✅ |
| `/profile` | User profile | ✅ |
| `/manage/:clubId` | Club admin dashboard | ✅ leader only |
| `/manage/:clubId/members` | Members & roles | ✅ leader |
| `/manage/:clubId/requests` | Join request queue | ✅ leader |
| `/manage/:clubId/events` | Event scheduler | ✅ leader |
| `/manage/:clubId/announcements` | Announcement publisher | ✅ leader |
| `/manage/:clubId/settings` | Club settings + radius | ✅ leader |
| `/manage/:clubId/payouts` | Revenue tracker | ✅ leader |
| `/admin-console` | Platform admin | ✅ admin login |
| `/admin-console/users` | User registry | ✅ admin |
| `/admin-console/clubs` | Club moderation | ✅ admin |
| `/admin-console/memberships` | All membership requests | ✅ admin |
| `/admin-console/events` | All events | ✅ admin |
| `/admin-console/activity` | Audit log | ✅ admin |

---

## 🔧 Architecture

```
tribu/
├── src/
│   ├── api/
│   │   └── mockApi.js          # Auth, registry, activity log
│   ├── components/
│   │   ├── JoinButton.jsx      # Join / pay / request flow
│   │   ├── TopBar.jsx          # Navigation + notifications
│   │   └── ui.jsx              # Shared primitives (Modal, Toast, Avatar…)
│   ├── context/
│   │   └── AppContext.jsx      # Per-user state + localStorage isolation
│   ├── data/
│   │   ├── clubs.json          # 10 club records
│   │   ├── events.json         # Future-dated events (Dec 2026 / Jan 2027)
│   │   ├── members.json
│   │   ├── misc.json           # Notifications, announcements, payouts
│   │   ├── requests.json
│   │   └── user.json
│   ├── pages/
│   │   ├── admin/              # Club management (leader dashboard)
│   │   ├── admin-console/      # Platform admin dashboard
│   │   ├── AdminConsole.jsx
│   │   ├── Auth.jsx
│   │   ├── ClubPage.jsx
│   │   ├── Home.jsx
│   │   ├── MyEvents.jsx
│   │   └── …
│   ├── __tests__/
│   │   ├── setup.js
│   │   ├── mockApi.test.js     # 14 auth / registry tests
│   │   ├── eventFilter.test.js # 5 date-filter tests
│   │   └── joinButton.test.js  # 8 join state-machine tests
│   └── styles/
│       └── global.css
├── index.html
├── vite.config.js
└── package.json
```

### State management

- **React Context** (`AppContext`) — per-user state for joined clubs, RSVPs, announcements, notifications, join requests.
- **localStorage** — keyed by user ID (`tribu-state-v2-{id}`) for complete cross-account isolation.
- **sessionStorage** — admin login token (clears on tab close).

### Password handling

> **Academic note:** Passwords are hashed with djb2 before storage in localStorage. This is **not** production-secure — it is used to avoid storing plaintext in localStorage for the academic demo. A real application must hash server-side with bcrypt/argon2.

---

## ✅ Fixed issues (v2)

| # | Issue | Fix |
|---|---|---|
| 1 | `index.html` contained concatenated `npm install` text | Removed from DOCTYPE line |
| 2 | All event dates were in October 2026 (past) | Updated to December 2026 / January 2027 |
| 3 | Auth form pre-filled with Léa's credentials | Cleared — users log in themselves |
| 4 | Single hardcoded user — no real auth | Multi-account registry with password hashing |
| 5 | All accounts shared the same localStorage key | Per-user key `tribu-state-v2-{id}` |
| 6 | Calendar opened to hardcoded October 2026 | Initialised to `new Date()` |
| 7 | "Next Up" showed past events | Added `date >= today` filter |
| 8 | Suggested clubs showed only 6 hardcoded IDs | Dynamically filters joined + private clubs |
| 9 | Location radius slider was display-only | Fully wired to persistence state |
| 10 | Announcements didn't create notifications | `postAnnouncement` creates both |
| 11 | Join requests not visible in leader dashboard | `JoinButton` now adds to shared `reqs` |
| 12 | Join request cancel was broken | Removes from `reqs` and clears `joined` |
| 13 | Admin Console had no login protection | sessionStorage admin auth gate |
| 14 | Admin Console had no dashboard content | Full KPI dashboard + 5 sub-pages |
| 15 | AdminLayout referenced deleted `leader` export | Now uses `user` from context |

---

## 🧪 Tests

```bash
npm test

 ✓ src/__tests__/eventFilter.test.js   (5 tests)
 ✓ src/__tests__/joinButton.test.js    (8 tests)
 ✓ src/__tests__/mockApi.test.js       (14 tests)

 Test Files  3 passed (3)
      Tests  27 passed (27)
```

**Coverage areas:**
- Signup validation (email, password length, name length, duplicate)
- Login success, case-insensitivity, wrong password, unknown email
- Admin login/logout/session management
- Activity log ordering
- Event date filter (past, today, future)
- Join flow state machine (direct, payment, request, cancel)

---

## 📄 Technology stack

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Bundler | Vite 8 |
| Routing | React Router v7 |
| Icons | Lucide React |
| Fonts | Plus Jakarta Sans (Fontsource) |
| Styling | Vanilla CSS (no framework) |
| State | React Context + localStorage |
| Testing | Vitest + @testing-library/react + jsdom |

---


