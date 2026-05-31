# Slides Guide — NUverse Laguna
## Simple, clear, anyone can follow. 20 minutes max.

> **Rule for every slide:** Big text. Few words. Let your mouth do the explaining, not the slide.

---

## SLIDE 1 — Title

**What's on screen:**
- **NUverse Laguna** (big, bold)
- *A Campus Digital Ecosystem for National University Laguna*
- Team names | Course & Section | Date

**Visual:** Landing page hero screenshot, or the NU Laguna logo + app logo side by side

---

## SLIDE 2 — The Problem

**Header:** The Problem

**4 bullets (short):**
- No safe, campus-exclusive place to buy and sell items
- Checking official NU merchandise stock requires going to the store physically
- Campus announcements, events, and info are scattered everywhere
- No dedicated digital home for the NU Laguna community

**Visual:** Split image — messy group chats / Facebook on one side, a question mark on the other

**What to say:**
> "If you're a student here and you want to sell your old textbooks — where do you go? Facebook Marketplace, which isn't safe and has zero campus focus. Want to know if the NU polo is in stock? You'd have to physically show up. Campus info is spread across group chats and bulletin boards. There's no single home for NU Laguna students online. That's what we set out to fix."

---

## SLIDE 3 — The Solution

**Header:** NUverse Laguna

**One-liner under header:**
> *One platform. Everything a Bulldog needs.*

**8 module cards in a grid:**
- 🛒 Marketplace
- 👕 Bulldog Exchange
- 📅 Campus Events
- 🔍 Lost & Found
- 📢 Announcements
- 💬 Direct Messaging
- 👤 User Profiles
- 🐶 Bulldog Chibi (XP System)

**Visual:** Dashboard screenshot

**What to say:**
> "NUverse Laguna has 8 modules — all working together in one app. Marketplace for buying and selling. Bulldog Exchange for official NU merchandise with a reservation system. Events, announcements, lost and found, messaging between students, and a Bulldog Chibi companion that rewards you with XP for being active. Let me walk you through how we built it."

---

## SLIDE 4 — Tech Stack

**Header:** What We Built It With

**Two clean columns:**

| Frontend (What users see) | Backend (Behind the scenes) |
|---|---|
| React + TypeScript | Java 21 + Spring Boot |
| Clean, fast, responsive UI | Handles all the logic and data |
| Works in light and dark mode | REST API with role-based security |
| PostgreSQL database | 25 database migrations |

**Visual:** Simple diagram — Browser → API → Database

**What to say:**
> "The frontend is React with TypeScript — that's what you see and click. The backend is Java Spring Boot — that handles all the business logic and security. The database is PostgreSQL. All three layers talk to each other through a REST API."

---

## SLIDE 5 — Architecture

**Header:** How We Organized the Code

**Show this flow clearly:**

```
Request comes in
       ↓
  Controller        ← Receives the request, passes it on
       ↓
Service Interface   ← Defines WHAT should happen
       ↓
 Service Impl.      ← Defines HOW it happens
       ↓
Domain Entity       ← The actual data + behavior
       ↓
  Repository        ← Talks to the database
```

**One line below:** *Each layer has ONE job. They never skip each other.*

**Visual:** Clean vertical diagram with arrows, each layer a different color box

**What to say:**
> "Every feature in our app follows this exact same pattern. The Controller receives the request and passes it to the Service. The Service handles the logic. The Repository handles the database. No layer skips another. This structure makes the code predictable, maintainable, and easy to test — even months later."

---

## SLIDE 6 — Encapsulation

**Header:** OOP Pillar 1 — Encapsulation

**Simple analogy first (big text):**
> 🏧 *Like an ATM. You press buttons to withdraw cash. You don't reach inside and grab the money yourself. The ATM controls its own process.*

**Then the code version:**
```java
// Instead of this (bad):
user.setStatus("SUSPENDED")
user.setSuspendCount(user.getSuspendCount() + 1)

// We do this (encapsulation):
user.suspend(until, reason)
// The User handles it internally — we just ask it to.
```

**More examples in small text:**
- `listing.markAsSold()` — listing manages its own state
- `reservation.expire()` — reservation manages its own expiry
- `event.archive()` — event archives itself

**What to say:**
> "Encapsulation means an object controls its own state. Think of an ATM — you don't reach inside to take money, you press a button and the machine handles it. Same idea here. When we suspend a user, we don't manually flip fields from outside. We call `user.suspend()` and the User entity handles everything internally — update the status, increment the count, store the reason. The rest of the code just makes the request. The object does the work."

---

## SLIDE 7 — Abstraction

**Header:** OOP Pillar 2 — Abstraction

**Simple analogy first:**
> 🚗 *Like driving a car. You use the steering wheel and pedals. You don't need to know how the engine works to drive.*

**Then the code version:**
```
BulldogExchangeController
         ↓ uses
BulldogExchangeService  ← interface (the steering wheel)
         ↓ powered by
BulldogExchangeServiceImpl  ← actual engine (400+ lines of logic)
```

**Key point (bold):** *The controller only knows WHAT to call. Not HOW it works.*

**What to say:**
> "Abstraction means hiding complexity. When you drive a car, you just turn the wheel — you don't need to understand the engine. Same thing here. Our controller calls `exchangeService.getProducts()`. It doesn't know or care how the data is fetched, filtered, or mapped. That 400-line implementation is hidden behind a simple interface. Simple to use from the outside, complex logic kept separate."

---

## SLIDE 8 — Inheritance & Polymorphism

**Header:** OOP Pillars 3 & 4

**Split the slide in two halves:**

**LEFT — Inheritance:**
> 👨‍👩‍👧 *Like inheriting traits from your parents — but you can also have your own.*

Code:
```java
ResourceNotFoundException extends RuntimeException
BusinessException extends RuntimeException
UnauthorizedException extends BusinessException
```
*Specialized exceptions build on general ones.*

---

**RIGHT — Polymorphism:**
> 📱 *Like the "Pay" button on different apps. Same button — GCash, credit card, or cash — different behavior.*

Code:
```java
XpStrategy strategy = factory.forSource(XpSource.DAILY_LOGIN)
strategy.award(userId)  // different result depending on the source
```

**What to say:**
> "Inheritance is like family traits — our custom exceptions inherit from Java's RuntimeException. They get the base behavior but add their own specifics. Polymorphism is like the Pay button on different payment apps — same button, different behavior depending on what's behind it. In our app, every XP source calls the same `award()` method, but each one gives different XP. Same call, different result — that's polymorphism."

---

## SLIDE 9 — THE STAR SLIDE — Strategy Pattern

**Header:** 🌟 Design Pattern: Strategy

**Top — the problem:**
> "We have 11 ways to earn XP. Each gives different points. How do we avoid a massive messy if-else chain?"

**Middle — the solution diagram:**

```
User logs in → XpSource.DAILY_LOGIN
                    ↓
            XpStrategyFactory
                    ↓
         DailyLoginStrategy.award()  →  +10 XP

User lists item → XpSource.FIRST_LISTING
                    ↓
            XpStrategyFactory
                    ↓
        FirstListingStrategy.award()  →  +50 XP

User RSVPs → XpSource.EVENT_RSVP
                    ↓
            XpStrategyFactory
                    ↓
          EventRsvpStrategy.award()  →  +15 XP
```

**Bottom — the key insight:**
> *Same `award()` call every time. 11 different behaviors. No if-else. Open for extension.*

**What to say:**
> "This is our favorite part of the system and our strongest OOP example. The Chibi XP system rewards students for different actions — 11 actions total. Without a design pattern, we'd have a giant if-else chain: 'if daily login give 10, else if first listing give 50' — and every new action means editing that chain. Messy and risky. Instead, we used the Strategy Pattern. Each action has its own Strategy class. They all implement the same `XpStrategy` interface with one method: `award()`. A factory returns the right strategy at runtime. The caller just says `strategy.award()` — it doesn't know or care which one it got. That's the Strategy Pattern on top of polymorphism."

---

## SLIDE 10 — SOLID Principles

**Header:** SOLID — 5 Principles, All Applied

**Table format (simple):**

| Letter | Means | Our Example |
|---|---|---|
| **S** | One class, one job | AuthService does auth only. ProfileService does profiles only. |
| **O** | Add new things without breaking old things | New XP source = new class. Never modify existing ones. |
| **L** | Any version can replace another | Swap service implementation — controller still works |
| **I** | Keep interfaces small and focused | Each service interface only has methods for its module |
| **D** | Depend on the general, not the specific | Controllers use interfaces, Spring injects the real class |

**What to say:**
> "SOLID is a set of 5 design rules. S — each class has one job. O — our XP system is open for new features without changing existing code. L — any service implementation is interchangeable with its interface. I — our interfaces are small and focused. D — controllers depend on interfaces, not on concrete classes. Spring handles the wiring at runtime."

---

## SLIDE 11 — GRASP Principles

**Header:** GRASP — Who's Responsible for What?

**Simple analogy:**
> 🏢 *Like a well-run company — everyone has a clear role and doesn't do each other's job.*

**5 principles in simple terms:**

| Principle | Simple Version | In Our App |
|---|---|---|
| **Controller** | Receptionist — receive and pass on | Spring MVC controllers route requests, delegate to services |
| **Information Expert** | The one who knows, does | Entities manage their own data (`user.suspend()`) |
| **Creator** | The builder makes the thing | Static factory methods: `User.create()`, `Reservation.create()` |
| **Low Coupling** | Departments don't depend on each other | Modules talk through events, not direct calls |
| **High Cohesion** | Each team focuses on one thing | Each module package = one responsibility |

**What to say:**
> "GRASP tells us who should be responsible for what. Think of it like a well-run company. The receptionist receives calls and passes them to the right department — that's our Controller. The expert in each department handles their own work — that's Information Expert. Departments don't directly depend on each other; they send memos — that's Low Coupling through our event system."

---

## SLIDE 12 — Event-Driven Design (Low Coupling Visual)

**Header:** How Modules Stay Independent

**Visual diagram — this is important:**

```
Marketplace Module
    |
    | fires MarketplaceListingCreatedEvent
    ↓
Spring Event Bus
    ↓                    ↓
XP System          Notification System
awards XP          sends notification

(Marketplace doesn't know XP or Notifications exist)
```

**Key point (bold):**
> *Modules communicate through events — never through direct calls. Remove one module and nothing else breaks.*

**What to say:**
> "Here's a concrete example of low coupling. When a student creates a marketplace listing, the Marketplace module fires an event: 'a listing was created.' It doesn't call the XP system directly. The XP system is listening for that event and awards XP when it hears it. The Notification system is also listening and sends a notification. Marketplace doesn't know either of them exist. This is event-driven design — modules are independent, loosely coupled."

---

## SLIDE 13 — Testing & Bonus Features

**Header:** We Didn't Just Build It — We Tested It

**Left side — Testing:**
- **219 backend tests** — every service and controller
- **131 frontend tests** — every component and hook
- Spring MockMvc for API testing
- *"If we break something, a test catches it before the user does."*

**Right side — Bonus Features:**
- ✅ **Exceptional UI/UX** — editorial design, animations, dark/light mode, Bulldog Chibi
- ✅ **Advanced Security** — HTTP-only JWT, role-based access, timed account suspension
- ✅ **Concurrency** — 4 background scheduled tasks running automatically

**What to say:**
> "We have 219 backend tests and 131 frontend tests. That's not just to check a box — it means we can change the code confidently knowing a test will catch any breaks. On the bonus features side: our UI was designed intentionally — dark mode, light mode, animations, mobile responsive. Security uses HTTP-only cookies for JWT so tokens can't be stolen by scripts. And we have 4 background jobs running automatically — suspension expiry, event archiving, reservation cleanup."

---

## SLIDE 14 — Thank You / Demo Time

**Header:** Now Let's See It Live.

**Simple content:**
- Team names
- *"Thank you for your time."*

**Visual:** Full-screen screenshot of the app looking its best (dashboard in dark mode)

**What to say:**
> "That covers the design and architecture. Now let me show you the actual thing."

---

---

# SLIDE DESIGN TIPS

**Colors to use:**
- NU Blue: `#1f3a8a`
- Gold accent: `#f5b300`
- White/light gray background for most slides
- Dark background (#0a0d14) for title and thank-you slides

**Font rules:**
- Headers: Bold, at least 36pt
- Body text: 20–24pt minimum — if it's smaller, cut the text
- Code snippets: monospace font (Courier New or Consolas), 18pt

**Slide density:**
- MAX 5 bullet points per slide
- If a slide feels crowded — split it into two
- Diagrams > bullet points whenever possible

**Most important slides (spend the most time making these look great):**
1. Slide 9 — Strategy Pattern (your headline, make the diagram clear and readable)
2. Slide 6 — Encapsulation (the ATM analogy visual)
3. Slide 5 — Architecture (the layer diagram)
4. Slide 3 — The Solution (module grid, use the dashboard screenshot)

**Slide order:**
1. Title
2. Problem
3. Solution
4. Tech Stack
5. Architecture
6. Encapsulation
7. Abstraction
8. Inheritance + Polymorphism
9. 🌟 Strategy Pattern
10. SOLID
11. GRASP
12. Event-Driven Design
13. Testing + Bonus
14. Thank You / Demo
