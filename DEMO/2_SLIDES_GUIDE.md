# Slides Guide — NUverse Laguna
## 14 slides. Simple. Visual. Anyone can follow.

> Rule: Big text. Few words. Your mouth does the explaining — not the slide.
> Colors: NU Blue #1f3a8a | Gold #f5b300 | White background for most slides

---

## SLIDE 1 — Title
**What's on screen:**
- Big bold: **NUverse Laguna**
- Small: *A Campus Digital Ecosystem — National University Laguna*
- Team names | Course & Section | Date

**Visual:** Screenshot of the landing page or the NU logo next to the app logo

---

## SLIDE 2 — The Problem
**Header:** The Problem

**4 bullets:**
- No safe, campus-exclusive place to buy and sell items online
- Checking official NU merchandise stock requires going to the store physically
- Campus events and announcements are scattered across group chats and bulletin boards
- No single digital home for the NU Laguna community

**Visual:** Side-by-side: messy group chats on the left, a question mark on the right

---

## SLIDE 3 — The Solution
**Header:** NUverse Laguna — One Platform, Everything You Need

**8 icons in a grid (use emoji or simple icons):**
🛒 Marketplace | 👕 Bulldog Exchange | 📅 Campus Events | 🔍 Lost & Found
📢 Announcements | 💬 Direct Messaging | 👤 User Profiles | 🐶 Bulldog Chibi

**Visual:** Dashboard screenshot

---

## SLIDE 4 — Tech Stack
**Header:** Built With

| Frontend | Backend |
|---|---|
| React + TypeScript | Java 21 + Spring Boot |
| Tailwind CSS | Spring Security + JWT |
| TanStack Query | JPA + Hibernate |
| Zustand | PostgreSQL + Flyway |

**Visual:** Simple left→right diagram: Browser → API → Database

---

## SLIDE 5 — Architecture
**Header:** How the Code is Organized

Show this flow (make it a visual diagram with boxes and arrows):
```
Request
   ↓
Controller       — receives and delegates
   ↓
Service Interface — defines WHAT to do
   ↓
Service Impl.    — does the actual work
   ↓
Domain Entity    — holds data + behavior
   ↓
Repository       — talks to the database
```

**One line below:** *Every module follows this exact structure. No layer skips another.*

---

## SLIDE 6 — Encapsulation
**Header:** Encapsulation

**Analogy (big text):**
> 🏧 Like an ATM — you press a button to withdraw money. You don't reach inside to grab it. The machine controls its own process.

**Code example:**
```java
// Instead of setting fields from outside:
user.setSuspended(true)
user.setSuspendCount(count + 1)

// We do this — the entity handles itself:
user.suspend(until, reason)
```

**One line:** *Objects control their own state. Nothing reaches in and flips their fields directly.*

---

## SLIDE 7 — Abstraction
**Header:** Abstraction

**Analogy:**
> 🚗 Like driving a car — you use the wheel and pedals. You don't need to understand how the engine works.

**Diagram:**
```
Controller
    ↓ uses
BulldogExchangeService  ← the interface (simple steering wheel)
    ↓ powered by
BulldogExchangeServiceImpl  ← 400+ lines of actual logic (the engine)
```

**One line:** *Controller calls `service.getProducts()`. It doesn't know or care how. That's abstraction.*

---

## SLIDE 8 — Inheritance + Polymorphism
**Header:** Inheritance & Polymorphism

**Left half — Inheritance:**
> 👨‍👩‍👧 Specialized classes inherit from base classes

```java
ResourceNotFoundException extends RuntimeException
BusinessException extends RuntimeException
```
*Our error handler catches them at the right level.*

**Right half — Polymorphism:**
> 📱 Same action, different behavior — like a Pay button working differently for GCash vs credit card

```java
strategy.award(userId)
// Different XP per source — same method call
```

---

## SLIDE 9 — ⭐ STRATEGY PATTERN (Your star slide)
**Header:** Design Pattern — Strategy ⭐

**The problem (top):**
> We have 11 ways to earn XP. Each gives different points. If we use if-else, every new source breaks existing code.

**The solution (big diagram — spend time making this clear):**

```
User logs in
    ↓
XpSource.DAILY_LOGIN
    ↓
XpStrategyFactory
    ↓
DailyLoginStrategy → award() → +10 XP

User creates listing
    ↓
XpSource.FIRST_LISTING
    ↓
XpStrategyFactory
    ↓
FirstListingStrategy → award() → +50 XP
```

**Bottom line (bold):**
> *11 actions. 11 classes. Same `award()` call. Add new source = add new class. Never touch existing ones.*

---

## SLIDE 10 — SOLID
**Header:** SOLID Principles

| | Means | In Our App |
|---|---|---|
| **S** | One class, one job | AuthService does auth only. ProfileService does profiles only. |
| **O** | Add new, don't break old | New XP source = new class, no existing code touched |
| **L** | Any version can replace another | Service implementations are interchangeable with their interfaces |
| **I** | Small, focused interfaces | Each service interface only has methods for its module |
| **D** | Depend on abstractions | Controllers use interfaces; Spring injects the real class |

---

## SLIDE 11 — GRASP
**Header:** GRASP Principles

> 🏢 Like a well-run company — everyone has a clear role and doesn't do each other's job.

| Principle | In Our App |
|---|---|
| **Controller** | Spring MVC controllers — receive request, pass to service, that's it |
| **Information Expert** | Entities manage their own state: `user.suspend()`, `listing.markAsSold()` |
| **Creator** | Static factory methods: `User.create()`, `Reservation.create()` |
| **Low Coupling** | Modules fire events — never call each other directly |
| **High Cohesion** | Each module package = one area of responsibility |

---

## SLIDE 12 — Low Coupling (Event-Driven)
**Header:** How Modules Stay Independent

**Diagram (important — make this visual):**
```
Marketplace creates a listing
          |
          ↓ fires event: ListingCreatedEvent
          |
    Spring Event Bus
          |
    ↙           ↘
XP System    Notification System
awards XP    sends notification

Marketplace doesn't know these exist.
```

**One line:** *Remove the XP system entirely — Marketplace still works perfectly.*

---

## SLIDE 13 — Testing + Bonus
**Header:** Evidence of Quality

**Left — Testing:**
- **219 backend tests** — every service and controller
- **131 frontend tests** — every component and hook
- Spring MockMvc for API testing

**Right — Bonus Features:**
- ✅ **Exceptional UI/UX** — editorial design, dark/light, animations
- ✅ **Advanced Security** — HTTP-only JWT, role-based, suspension
- ✅ **Concurrency** — 4 background scheduled tasks running automatically

---

## SLIDE 14 — Thank You
**Header:** Now Let's See It Live.

**Visual:** Full-screen dashboard screenshot (dark mode looks great)
**Text:** Team names. *"Thank you."*

---

## Slide Design Tips
- **Font:** Bold for headers (36pt+), regular for body (20-24pt)
- **Code snippets:** Use monospace font (Courier New), light gray background box
- **Most important slides to make look good:** 9 (Strategy), 5 (Architecture), 6 (Encapsulation)
- **Slide 9** is your headline — make the diagram big, clear, readable from the back of the room
- If a slide looks crowded — cut text. Less is more.
