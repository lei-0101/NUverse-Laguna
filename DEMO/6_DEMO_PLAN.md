# Demo Day Plan — NUverse Laguna
## Everything you do tomorrow, step by step.

---

## TONIGHT (Do These Before You Sleep)

- [ ] Read `3_SCRIPT.md` all the way through — twice
- [ ] Read `4_OOP_CHEATSHEET.md` — especially Strategy Pattern and Encapsulation
- [ ] Skim `5_QNA_PREP.md` — know the answers, don't memorize
- [ ] Build your slides using `2_SLIDES_GUIDE.md`
- [ ] Do a practice run of the demo flow once (5 minutes, browser open)
- [ ] Charge your laptop
- [ ] Sleep. Seriously.

---

## TOMORROW MORNING (1–2 Hours Before)

### Start the App
```bash
# Terminal 1 — Backend
cd /workspaces/NUverse-Laguna/backend/demo
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

# Terminal 2 — Frontend
cd /workspaces/NUverse-Laguna/frontend
npm run dev
```

### Test Everything Works
Open http://localhost:5173 and check:

- [ ] Login as student1@students.nu-laguna.edu.ph / Student@12345
- [ ] Dashboard loads
- [ ] Bulldog Exchange — click a product — sizes show (XS, S, M, L, XL, 2XL, 3XL, 4XL, 5XL, 6XL)
- [ ] Marketplace — listings visible
- [ ] Log out → Log in as admin@nu-laguna.edu.ph / Admin@12345
- [ ] Admin Panel opens → Users tab shows 5 users
- [ ] Log back out — browser ready and logged out for the presentation

### Prep the Browser
- [ ] Browser zoom: 90%
- [ ] Only one browser window open, on the app, logged out
- [ ] If Codespace: Port 5173 set to Public visibility

### Open Your Slides
- [ ] Presentation mode ready
- [ ] Slide 9 (Strategy Pattern) clearly visible from back of room

---

## THE DEMO FLOW (5 minutes — keep it tight)

| # | Action | What to Say | Time |
|---|---|---|---|
| 1 | Login as student | "Let me log in as a student." | 20s |
| 2 | Show dashboard | "Time-aware greeting. Live events and listings from the backend." | 30s |
| 3 | Go to Exchange, click product, select size | "Individual size variants. Select one and reserve — confirmation modal shows item price plus ₱50 fee." | 1 min |
| 4 | Go to Marketplace, click listing | "Buy and sell. Message the seller directly from the listing — no sharing personal contact." | 45s |
| 5 | Log out → Log in as admin | "Admin panel. User management, suspension with custom duration and reason." | 1 min |
| 6 | Click Chibi bottom-right | "XP system — Strategy Pattern working live. Different sources, same `award()` method, different XP." | 30s |

---

## YOUR 3 STAR TALKING POINTS

Know these cold. If they only remember 3 things — make it these:

### 1. Strategy Pattern + Polymorphism
> *"11 XP sources. 11 strategy classes. All implement `award()`. Same call, different behavior. Add new source — add one class, touch nothing else. That's Strategy Pattern on top of polymorphism."*

### 2. Layered Architecture
> *"Controller receives → Service Interface defines → Service Impl does the work → Domain Entity holds behavior → Repository hits database. No layer skips another. Every module follows this."*

### 3. Event-Driven Low Coupling
> *"Marketplace fires an event. XP system listens. They don't depend on each other. Remove XP — Marketplace still works. That's low coupling."*

---

## IF THINGS GO WRONG

| Problem | Response |
|---|---|
| App crashes | "Let me show the architecture from this slide instead." Point at architecture slide. |
| Feature not loading | "The API is processing — let me narrate what's happening." |
| Database looks wrong | "We have this seeded in our DevDataSeeder — let me show that code." |
| Forgot an answer | Pause. Say: "Let me think about that." Then answer. Never blurt something wrong. |
| Evaluator asks about something we didn't build | "That was out of scope for this demo, but in production we'd handle it by..." |
| Blank on a question | "That's a great question — here's what I know..." then give partial answer confidently. |

---

## CODE LOCATIONS FOR LIVE Q&A

Open these fast if they ask:
- **Strategy Pattern:** `backend/.../modules/chibi/domain/XpStrategyFactory.java`
- **Encapsulation:** `backend/.../modules/auth/domain/User.java` → `suspend()` method
- **Abstraction:** `backend/.../modules/bulldog_exchange/application/BulldogExchangeService.java`
- **Events/Low Coupling:** `backend/.../shared/event/` folder
- **Global Error Handler:** `backend/.../shared/handler/GlobalExceptionHandler.java`
- **Background Tasks:** `backend/.../modules/bulldog_exchange/application/ReservationExpiryScheduler.java`

---

## AFTER THE PRESENTATION

Take a breath. Thank the evaluators.
Close the laptop calmly.
Whatever grade — you built something real. That counts.

---

## SCORING EXPECTATION

Based on what we built:

| Category | Expected |
|---|---|
| Software Design & OOP (40%) | 36–38 / 40 |
| Implementation & Usability (40%) | 36–38 / 40 |
| Presentation (20%) | 16–18 / 20 (depends on you) |
| **Total** | **~88–94 / 100** |

Bonus points for Exceptional UI/UX + Advanced Security + Concurrency could push this higher. 🐾
