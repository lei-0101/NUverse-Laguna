# NUverse Laguna

A campus-exclusive fullstack web application for **National University Laguna** — a centralized digital ecosystem combining marketplace, official merchandise reservation, campus events, lost & found, announcements, direct messaging, and an XP-based Bulldog Chibi companion.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS v4, Zustand, TanStack Query, React Hook Form + Zod |
| Backend | Java 21, Spring Boot, Spring Security, JPA/Hibernate, JWT (HTTP-only cookies) |
| Database | PostgreSQL with Flyway migrations (V1–V25) |
| Auth | JWT in HTTP-only cookies — role-based access (Admin / Faculty / Student) |

---

## How to Run

### Prerequisites
- Java 21, Node.js 18+, PostgreSQL on port 5432

### Backend
```bash
cd backend/demo
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```
Starts on **port 8080**. The `dev` profile seeds all demo data on first run.

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Starts on **port 5173**.

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

## Modules

| Module | Description |
|---|---|
| **Authentication** | NU email-only registration, JWT sessions, role-based access, timed account suspension |
| **Marketplace** | Campus buy & sell — listings, search/filter, bookmarks, in-app messaging, reports |
| **Bulldog Exchange** | Official NU merchandise — individual size variants (XS–6XL), SHS/College categories, reservation + printable invoice |
| **Campus Events** | Faculty-published events — RSVP, reactions, comments, auto-archive |
| **Lost & Found** | Community bulletin board — report, search, resolve, comments, reactions |
| **Announcements** | Priority-coded campus updates (Critical/Important/General) — photo, reactions, admin lifecycle |
| **Direct Messaging** | 1:1 in-app conversations with unread count |
| **User Profiles** | Public/private profiles, follow system with approval flow, school labels |
| **Bulldog Chibi** | XP companion — 5 levels, 11 XP sources via Strategy Pattern, 200+ messages |
| **Notifications** | In-app bell — unread count, paginated history |
| **Admin Panel** | User management, suspension, announcements, report review |

---

## Architecture

Strict **layered architecture** with module-based package organization:

```
Controller → Service Interface → Service Implementation → Domain Entity → Repository
```

Each of the 10 modules is self-contained. Cross-module communication uses Spring's `ApplicationEventPublisher` — the XP system listens to events from other modules without direct coupling.

---

## Key OOP & Design Patterns

| Pattern | Where |
|---|---|
| **Strategy** | `XpStrategyFactory` — 11 XP sources, each its own strategy class |
| **Factory Method** | `User.create()`, `Reservation.create()`, `MarketplaceListing.create()` |
| **Repository** | Spring Data JPA — all data access abstracted |
| **DTO** | All API contracts use Request/Response DTOs — entities never exposed directly |
| **Observer/Event** | `ApplicationEventPublisher` + `@TransactionalEventListener` — decoupled side effects |
| **Dependency Injection** | Controllers depend on interfaces; Spring wires implementations |

---

## Testing

- **219 backend tests** — service + controller layers
- **131 frontend tests** — component + hook layers

---

## Database

25 Flyway migrations (V1–V25) — full schema history from initial tables through all feature additions.

---

## Project Structure

```
NUverse-Laguna/
├── backend/demo/           Spring Boot application
│   ├── src/main/java/      Modules + shared infrastructure
│   ├── src/main/resources/ application.yml + Flyway migrations
│   └── src/test/           219 backend tests
├── frontend/               React + TypeScript
│   ├── src/modules/        Feature modules
│   ├── src/shared/         Components, hooks, store, routes
│   └── src/index.css       Global styles + animations
├── DEMO/                   Presentation materials
├── changelog.md            Full version history (v0.1 → v0.40)
└── README.md               This file
```

---

## Bonus Features Applicable

- **Exceptional UI/UX** — editorial design, dark/light mode, animations, Bulldog Chibi
- **Advanced Security** — HTTP-only JWT, role-based access, timed suspension
- **Concurrency/Async** — 4 scheduled background tasks (suspension expiry, event archive, reservation expiry, XP dedup)

---

*National University Laguna — Finals Project 2026*
