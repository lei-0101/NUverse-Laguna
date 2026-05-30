# NUverse Laguna — Finals Demo Scope

**Purpose:** School finals project. Fully functional, demonstrable fullstack web app running inside a GitHub Codespace. Production deployment is NOT required.

---

## How to Run (Codespace)

```bash
# 1. Start PostgreSQL with a persistent volume (data survives container restarts)
docker run -d -p 5432:5432 \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=nuverse_laguna \
  -v nuverse_data:/var/lib/postgresql/data \
  postgres:15

# 2. Start backend — Flyway auto-runs migrations, seeder creates demo data
cd backend/demo && ./mvnw spring-boot:run

# 3. Start frontend
cd frontend && npm run dev

# 4. In Codespace Ports tab → set port 5173 to Public
```

> Email verification links appear in the Spring Boot terminal output. Copy and paste into the browser.

---

## Demo Accounts (pre-seeded — no signup needed)

| Role | Email | Password | What they can do |
|------|-------|----------|-----------------|
| **Admin** | admin@national-u.edu.ph | Admin@12345 | Everything — user management, moderation, announcements |
| **Faculty** | faculty@national-u.edu.ph | Faculty@12345 | Create/publish events, view all modules |
| **Student 1** | student1@national-u.edu.ph | Student@12345 | Full student experience |
| **Student 2** | student2@national-u.edu.ph | Student@12345 | Secondary student account for social features |
| **Student 3** | student3@national-u.edu.ph | Student@12345 | Third student for marketplace/events testing |

These are created by `DevDataSeeder.java` on every fresh startup (dev profile). Data persists in the Docker volume between restarts.

---

## PERMANENTLY OUT OF SCOPE

Never implement these — not needed for the demo:

- Dockerfile / docker-compose / nginx / any deployment config
- Cloud file storage (Cloudinary, Supabase, S3)
- Production SMTP / real email service
- HTTPS / COOKIE_SECURE
- Redis rate limiting / JWT refresh tokens
- Password reset / forgot password / account deletion
- Health check endpoint / `.env.example` / deployment docs

`DevEmailService` (console log) and `LocalStorageService` (local disk `uploads/`) are the correct and final implementations.

---

## The Visual Vision

### Overall Feel
Gen-Z energy. Game-y where it fits. Cute when it suits the feature. Premium without being stiff. A **breath of fresh air** — when students open this next to any other school portal, this one makes everything else look outdated.

**Light mode = campus daytime.** Warm sky, golden sunshine accents, crisp white surfaces.
**Dark mode = campus night.** Deep blue-black, CSS star field, glowing elements, the campus under the stars.

### Font (highest single-change visual impact)
```css
/* index.css — top of file */
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=JetBrains+Mono:wght@400;500&display=swap');
```
- **`Plus Jakarta Sans`** — all UI and headings. Used by Linear, Raycast. Confident and modern.
- **`JetBrains Mono`** — prices (₱), XP, counts, stats only. `tabular-nums` built in.

### Logo — NUverse Mark
Replace the current "N" box. The mark is a **circle (universe) + bold N + diagonal gold orbital + a tiny flying bulldog** in a NU jersey orbiting the N like a superhero. Fully inline SVG component. Animated version (bulldog orbits slowly) for the landing page only.

### Persistent Bulldog Chibi Companion
The signature feature. Floating fixed in bottom-right corner on EVERY page.
- **Always moving:** idle bob, tail wag, random emotes (yawn, look-around, scratch ear, bark, stretch)
- **Autonomous:** does emotes every 20–75s without user interaction
- **Once per day:** thought bubble with 3-dot animation → trivia/quote on click
- **Page-aware:** reacts to navigation (cheers on Events, curious on Marketplace, excited on Chibi page)
- **Click:** opens user's Chibi profile page. Hover: tail wags faster, eyes track cursor.

### Dark Mode Star Field
CSS star field renders behind all content in dark mode only. Three layers (100 small / 60 medium / 20 large stars) using the `box-shadow` technique — zero DOM weight. Plus a crescent moon SVG in top-right corner.

---

## Remaining Work — Full Priority List

### P0 — Do These First (highest visual impact + demo blockers)

- [ ] **Font: Plus Jakarta Sans + JetBrains Mono**
  Update `index.css`: Google Fonts import + `--font-sans` / `--font-mono` tokens. Apply `font-mono tabular-nums` to all price/XP/count elements. Single biggest visual improvement.

- [ ] **Logo: NUverseMark SVG component**
  `NUverseMark.tsx` — circle + N + diagonal gold orbital ellipse + tiny flying bulldog on the orbital. Wordmark: "**NU**" gold + "**verse**" foreground + "Laguna" tracked below. Replace all `<span>N</span>` instances.

- [ ] **CSS star field + day/night theming**
  `index.css` star layers (box-shadow technique, 3 layers). Crescent moon SVG in dark mode. Subtle mesh gradient background on hero sections. Sun radial glow in light mode.

- [ ] **Demo seed data (`DevDataSeeder.java`)**
  `@Profile("dev")`, runs on `ApplicationReadyEvent`. Creates the 5 demo accounts with real profile data + sample content: marketplace listings, exchange products with variants, published events, sample announcements, sample suggestions, follow relationships between students.

- [ ] **Mobile navigation — hamburger menu**
  Hamburger button replaces `hidden sm:flex` nav on mobile. Full-screen or slide-in drawer with all nav items.

### P1 — Broken Features + Foundation

- [ ] **Toast system** — global `<ToastProvider />`, `useToast()` hook, bottom-right spring-in/out, 4s auto-dismiss with progress bar. Types: success/error/info/warning. Wire to every mutation.

- [ ] **React ErrorBoundary** — class component wrapping app root. Friendly fallback: "Something went wrong 🐾" + Go Home button.

- [ ] **NEW_FOLLOWER notification** — add `UserFollowedEvent` to `shared/event`, wire `NotificationEventListener.onUserFollowed()`.

- [ ] **Notification click navigation** — clicking a notification navigates to the referenced item (reservation → `/exchange/reservations`, event → `/events/{id}`, follower → `/profile/{id}`).

- [ ] **Auto-logout after 10 minutes idle**
  `useIdleTimer` hook tracking `mousemove`/`keypress`/`click`/`touchstart`. At 9 min: "Still there? You'll be logged out in 60s" warning modal with countdown. At 10 min: auto-logout + redirect to login with "Logged out due to inactivity" message.

### P2 — Introduction + Core New Features

- [ ] **Introduction / Landing page** (`/` when unauthenticated)
  Full-screen hero: animated mesh gradient bg, NUverse mark (animated orbital bulldog), headline "Your Campus. Your Universe.", two CTAs. The flying bulldog soars across on load then settles as the companion. Scroll sections: module showcase + "Why NUverse?" + final CTA. Replaces current redirect-to-login behavior.

- [ ] **Home Dashboard** (replace placeholder)
  Real content: upcoming events widget (next 3), recent marketplace listings (latest 4), featured exchange products (3), unread notifications count, latest announcement card. Powered by `GET /api/dashboard` aggregation endpoint.

- [ ] **Emergency Announcements** — full backend + frontend
  `Announcement` entity (title, body, priority: GENERAL/IMPORTANT/CRITICAL, active). Admin creates/manages. CRITICAL = fixed site-wide banner below nav (backdrop blur, priority-colored, non-dismissible on mobile). Announcements page.

- [ ] **Lost & Found** — full backend + frontend
  `LostFoundItem` entity. Browse (filter: LOST/FOUND), post item, detail page, mark resolved. Warm amber (LOST) / green (FOUND) accent system.

- [ ] **Suggestions & Feedback** — full backend + frontend
  `Suggestion` entity, upvote system (one per user), admin status updates. ProductHunt layout: vertical upvote column + animated count.

- [ ] **Settings page** (`/settings`)
  Sections: Account (display name), Notifications (toggles per type), Appearance (theme + density), Privacy (same as profile privacy). Backend: `GET/PUT /api/settings/me` preferences entity.

### P3 — Gamification + Companion

- [ ] **Bulldog Chibi module** (XP system + Strategy Pattern)
  `BulldogChibi` entity (xp, level 1–5). `XpStrategy` interface + strategies: listing created (+10), reservation (+15), RSVP (+5), suggestion posted (+8). Profile section: animated XP bar, level shield badge, floating +XP text on earn.

- [ ] **Achievements & Titles**
  `Achievement` entity. Unlock triggers: first listing, 5 RSVPs, 10 follows, first suggestion. `Title` entity — equippable, shows on profile. Achievement cards: locked (greyscale + lock) / unlocked (golden glow).

- [ ] **BulldogCompanion component** (persistent floating chibi)
  Fixed bottom-right on every page. Autonomous emotes every 20–75s. Daily trivia bubble (localStorage). Page-aware reactions. Eye-tracking cursor. Hover: tail wags. Click: go to `/chibi`. See memory file [[feedback-levelups]] for full spec.

### P4 — Static Pages + Admin Panel + Polish

- [ ] **Inspire Sports Academy** — static info page (sports, schedule, CTA)
- [ ] **NUIS Integration** — static redirect page (single big CTA button)
- [ ] **Admin panel** (`/admin`) — users table (role change, suspend), reports list (resolve), announcements manager
- [ ] **Change password** — `PATCH /api/auth/password` + settings sub-page
- [ ] **Skeleton loaders** — per-page layout skeletons replacing spinners
- [ ] **Character counters** — live `n/max` counter on all text fields with limits
- [ ] **Confetti** — CSS-only burst on: registration, first listing, level up, achievement unlock
- [ ] **Leave guard** — `useBlocker` on create/edit forms

---

## Per-Feature Color & Atmosphere

| Module | Background Treatment | Accent Colors |
|--------|---------------------|---------------|
| Landing Hero | Animated mesh gradient + floating orbs | Primary/Accent/Success blend |
| Dashboard | Gradient top strip, warm grid | Module-specific per widget |
| Marketplace | Clean, image-forward | Green/teal for prices |
| Bulldog Exchange | Subtle gold-dust overlay | Gold/amber dominant |
| Campus Events | Category color bleeds into card bg | Per-category rainbow |
| Lost & Found | Warm amber tint (light) / amber-950/10 (dark) | Amber=LOST, Green=FOUND |
| Suggestions | Clean, minimal | Blue upvote, status-based |
| Announcements | Priority-matched atmospheric wash | Blue/Amber/Red |
| Bulldog Chibi | Space/game: dark bg, pixel stars, XP glow | Purple/blue/gold |
| Achievements | Rich deep bg, trophy glow | Gold dominant |
| Profile | NU gradient cover band | Primary range |
| Settings | Clean sectioned layout | Minimal accents |
| Admin | Flat, functional | Neutral |

---

## Engineering Rules (always follow)

1. Re-read `Additional-Rules-and-Flow.txt` and `Context-Rules-and-Flow.txt` before every feature
2. Layered architecture: Controller → Service → Domain → Repository
3. Entities carry behavior — never anemic setters in services
4. DTOs for all API contracts — never expose entities
5. Flyway migration for every schema change
6. Zustand: global state only. TanStack Query: all server state.
7. Strict TypeScript — no `any`
8. Feature fully functional + tested + changelog updated before next feature
9. Controller tests with `LocalDateTime` in request body: register a `SimpleModule` on the Jackson 2.x `ObjectMapper`

---

## What Is Already Done (v0.13.0)

| Module | Backend | Frontend | Tests |
|--------|---------|----------|-------|
| Authentication | ✅ | ✅ | ✅ |
| User Profiles | ✅ | ✅ | ✅ |
| Marketplace | ✅ | ✅ | ✅ |
| Bulldog Exchange | ✅ | ✅ | ✅ |
| Notifications | ✅ | ✅ | ✅ |
| Campus Events | ✅ | ✅ | ✅ |

Backend: 173 tests. Frontend: 131 tests. Migrations V1–V7. tsc clean. Build 325 modules.
