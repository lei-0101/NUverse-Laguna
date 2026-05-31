# Presentation Script — NUverse Laguna
## Casual, direct, complete. 20 minutes max.

> Say this in your own natural voice. Know the ideas — don't memorize word-for-word.
> The goal: they understand everything without needing to ask follow-up questions.

---

## PART 1 — INTRO (1 min)
*[Slide 1 — Title]*

> "Good morning / afternoon. We're Group [X]. We built NUverse Laguna — a campus web application made specifically for National University Laguna."

> "The name is National University plus universe — because the idea is that this becomes the center of student life online."

> "We'll walk you through the problem we solved, our solution, how we applied OOP concepts, the design patterns we used, then we'll show it live."

---

## PART 2 — THE PROBLEM (1 min)
*[Slide 2 — Problem]*

> "What problem are we solving?"

> "Right now, if a student here wants to sell old textbooks — they go to Facebook Marketplace. Not safe. Not campus-specific. If they want to check if the NU polo is in stock — they have to physically go to the store. If they want to know about upcoming events — they check group chats, Facebook posts, bulletin boards. Everything is scattered."

> "There's no single, safe, NU Laguna-exclusive platform for students. That's what we built."

---

## PART 3 — THE SOLUTION (1.5 min)
*[Slide 3 — Solution]*

> "NUverse Laguna brings everything into one place. Eight modules:"

> "Marketplace for safe campus buying and selling. Bulldog Exchange for official NU merchandise with reservations. Campus Events to RSVP and track what's happening. Lost and Found as a community board. Announcements for priority-coded campus updates from admin and faculty. Direct Messaging between students inside the app. User Profiles with follow and privacy settings. And the Bulldog Chibi — a personal companion that earns XP the more active you are on campus."

> "Let me explain how we built it, starting with the architecture."

---

## PART 4 — OOP CONCEPTS (5 min) ← MOST IMPORTANT
*[Slide 5 — Architecture]*

> "Every module in this app follows the same layered structure. A request comes in. The Controller receives it and passes it to the Service. The Service handles the logic. The Domain Entity holds the data and its own behavior. The Repository handles the database. No layer skips another. Clean, predictable, maintainable."

---

*[Slide 6 — Encapsulation]*

> "First OOP pillar — Encapsulation."

> "Think of an ATM. When you withdraw money, you press a button. You don't reach inside the machine to grab the cash yourself. The ATM manages its own internal process."

> "Same in our code. When we suspend a user, we don't reach into the User object and flip its fields manually. We call `user.suspend()` and the User entity handles everything internally — sets the status, increments the suspension count, stores the reason. Outside code just makes the request. The object does the work."

> "We do this everywhere — `listing.markAsSold()`, `reservation.expire()`, `event.archive()`. Behavior lives with the data it belongs to."

---

*[Slide 7 — Abstraction]*

> "Second — Abstraction."

> "Driving a car — you use the wheel and pedals. You don't need to understand how the engine works. Abstraction hides complexity."

> "In our app, every Controller talks to a Service Interface — not the actual implementation. The Controller calls `exchangeService.getProducts()` and gets results. It doesn't know or care whether that data comes from a database, a cache, or anything else. That 400-line implementation is hidden. The Controller only sees the simple interface."

---

*[Slide 8 — Inheritance + Polymorphism]*

> "Third — Inheritance. Our custom exceptions inherit from Java's base exception classes. `ResourceNotFoundException` extends `RuntimeException`. This lets our global error handler catch exceptions at different levels of specificity — specific ones or general ones — without writing a separate handler for each one."

> "Fourth — Polymorphism. Think of a Pay button. Whether it's GCash, credit card, or cash — you press the same button. Different behavior depending on what's behind it."

> "In our XP system, every reward source calls the same `award()` method. But daily login gives different XP than creating a listing, which gives different XP than RSVPing to an event. Same call, different behavior depending on the object. That's polymorphism."

---

## PART 5 — DESIGN PATTERNS (4 min) ← SECOND MOST IMPORTANT
*[Slide 9 — Strategy Pattern ⭐]*

> "Now design patterns. This is the most important part."

> "Our Bulldog Chibi earns XP from 11 different student actions. Each action gives different points. Without a design pattern, we'd write a giant if-else chain — 'if daily login give 10, else if listing created give 50' — and every new action we add means modifying that chain. That's risky and messy."

> "We used the Strategy Pattern. Here's exactly how it works:"

> "We have one interface called `XpStrategy` with one method: `award()`. We have 11 separate classes that implement it — one per action. `DailyLoginStrategy`, `FirstListingStrategy`, `EventRsvpStrategy`, and so on. We have a factory called `XpStrategyFactory` that returns the right strategy based on the action."

> "When a student logs in — the system calls `factory.forSource(DAILY_LOGIN)`, gets back a strategy, calls `award()`, and the student gets XP. The caller doesn't know which strategy it got. It just calls `award()`."

> "The key benefit: to add a new XP source, we add one new class. We never touch the 11 existing ones. That's the Open/Closed principle in action."

---

*[Slide 10 — SOLID]*

> "SOLID — five design principles, all applied."

> "S — Single Responsibility. Each class has one job. AuthService handles auth. ProfileService handles profiles. They don't overlap."

> "O — Open/Closed. The XP system is the perfect example. Open for new features — add a new class. Closed for modification — don't touch what already works."

> "L — Liskov Substitution. Any service implementation can replace its interface without breaking the caller."

> "I — Interface Segregation. Our service interfaces are small and focused — only the methods they need."

> "D — Dependency Inversion. Controllers depend on interfaces, not concrete classes. Spring injects the right implementation at runtime."

---

*[Slide 11 — GRASP]*

> "GRASP — responsibility assignment guidelines."

> "Think of a well-run company. The receptionist receives calls and passes them on — that's our Controller. The expert in each department handles their own work — that's Information Expert, where entities manage their own state. Builders create what they're responsible for — that's our static factory methods. And departments communicate through memos, not by walking into each other's offices — that's Low Coupling through our event system."

---

*[Slide 12 — Low Coupling]*

> "One more thing worth showing — how our modules stay independent."

> "When a student creates a marketplace listing, the Marketplace module doesn't call the XP system directly. That would create a dependency. Instead, Marketplace fires an event: 'a listing was created.' The XP system is listening and awards XP when it hears it. Marketplace doesn't know XP exists."

> "You could delete the XP system entirely — Marketplace still works. That's low coupling. And that's how we avoid one module breaking another."

---

## PART 6 — LIVE DEMO (5 min)
*[Switch to browser — app already running, user logged out]*

**Step 1 — Login + Dashboard (1 min)**
> "Let me log in as a student."
*(Enter credentials, submit)*
> "This is the dashboard. It's time-aware — it knows it's morning, afternoon, or evening. Live events and marketplace listings are pulled directly from the backend in real time."

**Step 2 — Bulldog Exchange (1 min)**
> "Bulldog Exchange — the official NU store."
*(Click Exchange in nav)*
> "Products are organized by SHS and College categories. Each product has individual size variants — XS, S, M, L, XL, 2XL, up to 6XL. Let me click one."
*(Click a product, select a size)*
> "When I select a size and reserve — I get a confirmation showing the item price plus the ₱50 handling fee. If confirmed, a reservation is created with a 48-hour pickup window. Sundays don't count. The student gets a printable invoice with a verification code."

**Step 3 — Marketplace (45 sec)**
> "Marketplace — campus buy and sell."
*(Click Marketplace)*
> "Students can browse, filter by category, condition, price. From a listing, they can message the seller directly through the app — no need to share personal contact info."

**Step 4 — Admin Panel (1 min)**
> "Let me switch to admin."
*(Log out, log in as admin)*
> "Admin panel. I can see all users — their role, status. I can suspend a user — set a custom duration and add a reason. When the ban expires, a background task automatically unsuspends them. That's one of our four background jobs running concurrently — suspension expiry, event archiving, reservation cleanup."

**Step 5 — Chibi XP (30 sec)**
> "Last — the Chibi XP system."
*(Click chibi in bottom-right)*
> "This is the Strategy Pattern working live. Each action — login, listing, RSVP — calls the same `award()` method on a different strategy. The Chibi levels up as XP accumulates."

---

## PART 7 — CLOSING (15 sec)

> "That's NUverse Laguna. Fullstack, fully tested, clean layered architecture, OOP applied throughout. Thank you. Happy to take any questions."

---

## Timing Guide

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

~2.5 minutes buffer for transitions and natural pauses. ✅

---

## 5 Things to Remember on the Day

1. **Slow down.** You know this better than anyone in the room.
2. **Use the analogies.** ATM, car, Pay button — they land with everyone, technical or not.
3. **Point at the code** on your slides when you explain OOP. Even just "this line right here" makes it concrete.
4. **Strategy Pattern is your headline.** If they remember one thing — make it that.
5. **Demo is live — narrate if something loads slowly.** Say: *"It's fetching from the backend now."* Shows you understand the system.
