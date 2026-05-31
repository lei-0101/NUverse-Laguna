# Presentation Script — NUverse Laguna
## Casual, simple, anyone can follow. 20 minutes max.

> **How to use this:** Read it, understand the idea behind each part, then say it in your own natural voice. Don't memorize word-for-word — that sounds robotic. Know the concept, deliver it naturally.

---

## PART 1 — INTRO (1 minute)
*[Slide: Title]*

> "Good morning / afternoon. We're Group [X], and we're presenting NUverse Laguna — a campus web application built specifically for the students and community of National University Laguna."

> "The name is 'National University' plus 'universe' — because the idea is that this app becomes the center of the student's digital campus life."

> "We built it fullstack — React and TypeScript on the frontend, Java Spring Boot on the backend, and PostgreSQL for the database. We'll go through the problem we solved, the app itself, how we applied OOP concepts, the design patterns we used, and then we'll show it live."

---

## PART 2 — PROBLEM STATEMENT (1 min)
*[Slide: The Problem]*

> "So what problem did we try to solve?"

> "If you're a student at NU Laguna right now and you want to sell your old textbooks — where do you go? Facebook Marketplace, which isn't campus-exclusive, has no safety features, and is not NU-specific. Want to check if the NU polo shirt is available? You'd have to physically go to the store. Want to know what events are coming up? It's scattered — group chats, Facebook posts, bulletin boards."

> "There's no single dedicated platform for the NU Laguna community. That's the problem we solved."

---

## PART 3 — THE APP (1.5 min)
*[Slide: NUverse Laguna — The Solution]*

> "NUverse Laguna brings everything together in one place. Eight modules:"

> "Marketplace — for safe campus buying and selling among verified students. Bulldog Exchange — the official NU merchandise store with a reservation system. Campus Events — RSVP and track events. Lost and Found — community board. Announcements — priority-coded campus updates from faculty and admin. Direct Messaging — students can talk to each other inside the app. User Profiles with a follow system. And the Bulldog Chibi — a personal companion that rewards you with XP for being active on campus."

> "Now let me explain the technical side — how we built it, and where OOP shows up."

---

## PART 4 — OOP CONCEPTS (5 min) ← MOST IMPORTANT PART

*[Slide: Architecture]*

> "Before the pillars — our architecture. Every single feature in this app follows the same layered structure."

> "A request comes in. The Controller receives it and passes it on — that's its only job. The Service handles the business logic — the rules and calculations. The Domain Entity holds the data and its own behavior. The Repository talks to the database. No layer skips another. Clean, predictable, maintainable."

---

*[Slide: Encapsulation]*

> "First pillar — Encapsulation."

> "Think of an ATM. When you withdraw money, you press buttons. You don't reach inside the machine to grab the cash yourself. The ATM controls its own process. Same idea in our code."

> "When we suspend a user — instead of reaching in and setting a dozen fields manually from outside, we just call `user.suspend()`. The User entity handles everything internally: sets the status, stores the reason, increments the suspension count. Outside code just makes the request. The object does the work."

> "We do this everywhere — `listing.markAsSold()`, `reservation.expire()`, `event.archive()`. Behavior lives with the data. That's encapsulation."

---

*[Slide: Abstraction]*

> "Second — Abstraction."

> "Think of driving a car. You use the steering wheel and pedals. You don't need to understand how the engine works to drive. Abstraction hides complexity."

> "In our app, the Controller only talks to a Service Interface — like the steering wheel. The actual implementation — 400 lines of logic — is hidden behind that interface. The Controller calls `exchangeService.getProducts()` and gets results. It doesn't care how those products were fetched, filtered, or mapped. That detail is abstracted away."

---

*[Slide: Inheritance + Polymorphism]*

> "Third — Inheritance. Our custom exceptions inherit from Java's base exceptions. `ResourceNotFoundException` extends `RuntimeException`. This lets our global error handler catch exceptions at different levels — specific ones or general ones — without writing separate handlers for each."

> "Fourth — Polymorphism. Think of the 'Pay' button. Whether you're paying with GCash, credit card, or cash — you press the same button. Different behavior depending on what's behind it."

> "In our XP system, every action calls the same `award()` method. But each action gives different XP. Daily login gives different points than creating a listing, which gives different points than posting on Lost and Found. Same call, different behavior — that's polymorphism."

---

## PART 5 — DESIGN PATTERNS (4 min) ← SECOND MOST IMPORTANT

*[Slide: Strategy Pattern — 🌟]*

> "Now design patterns. This is our strongest example."

> "The Bulldog Chibi earns XP from 11 different actions. Each gives a different amount of points. If we wrote that as a massive if-else chain — 'if daily login give 10, else if first listing give 50, else if event RSVP give 15' — it works, but it's messy. And every time we add a new action, we have to modify that chain. That's fragile."

> "We used the Strategy Pattern instead. Here's the idea: we created one interface called `XpStrategy` with one method: `award()`. Then we created 11 separate classes — one per action — each implementing that interface with their own XP logic. A factory called `XpStrategyFactory` returns the right one based on the action."

> "So when a user logs in, we call `factory.forSource(DAILY_LOGIN)` — we get back a strategy — we call `award()` — user gets XP. The code calling it doesn't know which strategy it got. It just calls `award()`. That's Strategy Pattern plus Polymorphism working together."

> "The benefit: to add a new XP source, we add one new class. We never touch the existing 11. That's called Open/Closed — which brings me to SOLID."

---

*[Slide: SOLID]*

> "SOLID is five design principles. Let me go through them fast:"

> "S — Single Responsibility. Each class has one job. AuthService handles auth only. ProfileService handles profiles only. They don't overlap."

> "O — Open/Closed. Open for new features, closed for modification. Perfect example: our XP system. Add a new reward? Add a new class. Don't touch what already works."

> "L — Liskov Substitution. Any service implementation can be swapped out without breaking the caller."

> "I — Interface Segregation. Our interfaces are focused, not bloated with unrelated methods."

> "D — Dependency Inversion. Controllers depend on interfaces, not on concrete implementations. Spring injects the real class at runtime. The controller never manually creates a service."

---

*[Slide: GRASP]*

> "GRASP — five more principles about responsibility assignment. Quick version:"

> "Think of a well-run company. The receptionist receives calls and passes them on — that's our Controller. The department expert handles their own work — Information Expert. The builder creates the thing — our factory methods like `User.create()`. Departments communicate through memos, not by walking into each other's offices — that's Low Coupling. And each team stays focused on one area — High Cohesion."

---

*[Slide: Event-Driven Design]*

> "One more design choice worth highlighting — event-driven architecture for low coupling."

> "When a student creates a marketplace listing, the Marketplace module doesn't call the XP system directly. That would create dependency between two unrelated modules. Instead, Marketplace fires an event: 'a listing was created.' The XP system is listening for that event and awards XP when it hears it. Marketplace doesn't know the XP system exists."

> "Remove the XP system completely — Marketplace still works. That's low coupling in action."

---

## PART 6 — LIVE DEMO (5 min)
*[Switch to browser — app is already running and logged out]*

**Step 1 — Login (30 sec)**
> "Let me log in as a student."
> *(Enter credentials → submit)*
> "Notice — after login, there's a brief loading screen with our Bulldog mascot. Small touch, but it's part of the experience."

**Step 2 — Dashboard (30 sec)**
> "This is the dashboard. It knows the time of day and greets accordingly. Live events and recent marketplace listings are pulled directly from the backend."

**Step 3 — Bulldog Exchange (1 min)**
> "Bulldog Exchange — the official NU store. Products are organized by SHS and College categories. Each product has individual size variants — XS, S, M, all the way to 6XL."
> *(Click a product)*
> "I can select a size. This triggers a confirmation modal showing the item price, the ₱50 reservation fee, and the total. If I confirm — a reservation is created, and the student gets a printable invoice with an anti-forgery verification code. The pickup window is 48 hours — Sundays don't count."

**Step 4 — Marketplace (45 sec)**
> "Marketplace — campus buy and sell. Students can browse, filter by category and condition, bookmark items. From the listing detail page, I can message the seller directly through the app — no need to share personal numbers."

**Step 5 — Admin Panel (1 min)**
> "Let me switch to the admin account."
> *(Log out → log in as admin)*
> "Admin panel. I can see all registered users. I can suspend an account — set a duration, add a reason. When the ban expires, a background scheduled task automatically unsuspends the user — no manual action needed. That's one of our four background jobs running concurrently."

**Step 6 — Chibi XP (30 sec)**
> "Last — the Chibi. This is our XP system in action."
> *(Click chibi icon bottom-right)*
> "Every active action earns XP — daily login, creating listings, RSVPing to events. The Chibi levels up as XP accumulates. And our companion in the corner has over 200 unique messages — he'll call you out if you procrastinate."

---

## PART 7 — CLOSING (15 sec)

> "That's NUverse Laguna. Fullstack, fully tested, clean layered architecture, and real OOP applied throughout. Thank you. Happy to take questions."

---

## TIMING

| Part | Time |
|---|---|
| Intro | 1 min |
| Problem | 1 min |
| Solution | 1.5 min |
| OOP: Architecture + 4 Pillars | 5 min |
| Design Patterns: Strategy, SOLID, GRASP, Events | 4 min |
| Live Demo | 5 min |
| Closing | 15 sec |
| **Total** | **~17.5 min** |

About 2.5 min buffer for transitions and natural pauses. ✅

---

## 5 THINGS TO REMEMBER ON THE DAY

1. **Slow down.** You know this better than anyone in the room. Take your time.
2. **Use the analogies.** ATM for encapsulation. Car for abstraction. Pay button for polymorphism. They land with everyone — technical or not.
3. **Point at code on the slides** when you explain OOP — even just saying "this line right here" makes it concrete.
4. **The Strategy Pattern is your headline.** If evaluators only remember one thing, make it that.
5. **Demo is live — be calm if something looks slow.** Narrate what's happening: *"It's fetching the data from the backend now."* Shows you understand the system.
