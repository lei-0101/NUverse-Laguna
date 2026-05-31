# NUverse Laguna

A campus-exclusive fullstack web application for the students, faculty, and staff of **National University Laguna**. NUverse Laguna is a centralized digital ecosystem that combines marketplace functionality, official merchandise reservation, campus events, lost & found, announcements, direct messaging, and a unique XP-based Bulldog Chibi companion into one modern, production-quality platform.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS v4, Zustand, TanStack Query, React Hook Form + Zod |
| Backend | Java 21, Spring Boot, Spring Security, JPA/Hibernate, JWT (HTTP-only cookies) |
| Database | PostgreSQL with Flyway migrations |
| Auth | JWT stored in HTTP-only cookies, role-based access (Admin / Faculty / Student) |

---

## Modules

### Authentication
- NU Laguna email-only registration (`@students.nu-laguna.edu.ph`)
- Email verification, JWT auth, HTTP-only cookie sessions
- Role-based access: Student, Faculty, Admin
- Account suspension system with timed bans

### Marketplace
- Campus buy & sell platform — list, search, filter, bookmark
- Image uploads, condition grading, category filters
- In-app messaging between buyer and seller
- Report listings for admin review

### Bulldog Exchange
- Official NU Laguna merchandise catalog with individual size variants (XS–6XL)
- SHS and College product categories
- Reservation system with 48-hour pickup window (Sundays excluded)
- ₱50 reservation handling fee, printable invoice with anti-forgery code
- Admin full CRUD: create/edit/deactivate products, add/edit/delete variants

### Campus Events
- Faculty-published events with RSVP, capacity tracking
- Emoji reactions and comment threads
- Auto-archive for finished events
- Admin delete controls

### Lost & Found
- Community bulletin board for lost and found items
- Full lifecycle: report → search → resolve
- Comments, emoji reactions, admin moderation

### Announcements
- Priority-coded announcements (Critical / Important / General)
- Photo attachments, emoji reactions, detail pages
- Admin full lifecycle: create, edit, archive, delete

### Direct Messaging
- 1:1 conversations between any two users
- Real-time-like polling, unread count badge in nav

### User Profiles
- Public / private profiles, follow system with approval flow for private accounts
- School code and enrollment year display
- Pending follow requests panel

### Bulldog Chibi (XP System)
- Persistent on-screen bulldog companion with 200+ personality-driven messages
- XP earned from: daily login, marketplace activity, RSVP, Lost & Found posts, profile completion, avatar upload
- 5 levels with visual tier upgrades and achievement unlocks
- Strategy Pattern: each XP source maps to its own strategy implementation

### Notifications
- In-app bell with unread count, paginated history
- Triggered by: marketplace activity, RSVP, follow requests, messaging

### Admin Panel
- User management: view, suspend (with duration + reason), reactivate
- Announcements management with priority controls
- Report review and close system
- Platform statistics dashboard

---

## Running the Project

### Prerequisites
- Java 21
- Node.js 18+
- PostgreSQL (running on port 5432)

### Backend

```bash
cd backend/demo
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

The backend starts on **port 8080**. The `dev` profile activates demo data seeding.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend starts on **port 5173**.

---

## Demo Accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@nu-laguna.edu.ph | Admin@12345 |
| Faculty | faculty@nu-laguna.edu.ph | Faculty@12345 |
| Student | student1@students.nu-laguna.edu.ph | Student@12345 |
| Student | student2@students.nu-laguna.edu.ph | Student@12345 |
| Student | student3@students.nu-laguna.edu.ph | Student@12345 |

---

## Architecture

The project follows a strict **layered architecture** with module-based package organization:

```
Controller → Service Interface → Service Implementation → Domain Entity → Repository
```

Each module (`auth`, `marketplace`, `bulldog_exchange`, `events`, `announcements`, `lost_found`, `messages`, `notifications`, `chibi`, `profile`, `reports`) is self-contained with its own controller, service, domain, repository, and DTO layers.

Cross-module communication uses Spring's `ApplicationEventPublisher` to maintain low coupling — for example, the XP system listens for events from other modules without those modules depending on the XP system directly.

---

## Key Design Patterns & OOP Highlights

- **Strategy Pattern** — `XpStrategyFactory` maps each `XpSource` enum to its own strategy class, making XP rewards open for extension without modifying existing code
- **Factory Method** — Domain entities use static factory methods (`User.create()`, `MarketplaceListing.create()`, `Reservation.create()`) instead of public constructors
- **Repository Pattern** — Spring Data JPA repositories abstract all data access
- **DTO Pattern** — Strict separation between API contracts (DTOs) and domain entities; entities are never exposed directly
- **Observer / Event-Driven** — `ApplicationEventPublisher` + `@TransactionalEventListener` for decoupled cross-module side effects
- **Dependency Injection** — All dependencies injected via constructor; controllers depend on interfaces, not implementations

---

## Database Migrations

25 Flyway migrations (V1–V25) covering full schema history from initial tables through feature additions. All migrations are versioned, documented, and reversible-safe.

---

## Testing

- **Backend:** 219 tests (service + controller layers)
- **Frontend:** 131 tests (component + hook layers)

---

## Project Structure

```
NUverse-Laguna/
├── backend/demo/          Spring Boot application
│   ├── src/main/java/     Java source (modules + shared)
│   ├── src/main/resources/ application.yml + Flyway migrations
│   └── src/test/          219 backend tests
├── frontend/              React + TypeScript application
│   ├── src/modules/       Feature modules
│   ├── src/shared/        Shared components, hooks, store, routes
│   └── src/index.css      Global styles + animations
├── changelog.md           Full version history (v0.1 → v0.40)
└── README.md              This file
```

---

## Changelog

See [changelog.md](changelog.md) for the full version history across 40 releases.

---

*Built for National University Laguna — Finals Project, 2026*
