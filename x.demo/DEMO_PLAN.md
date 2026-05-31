# Demo Day Plan — NUverse Laguna
## Everything you do tomorrow, in order.

---

## THE NIGHT BEFORE (Do these tonight)

- [ ] Read `PRESENTATION_SCRIPT.md` twice — know the flow
- [ ] Read `OOP_CHEATSHEET.md` — especially the Strategy Pattern section
- [ ] Read `QNA_PREP.md` — skim all answers, know them cold
- [ ] Make your slides using `SLIDES_GUIDE.md` as the blueprint
- [ ] Practice the demo flow once (login → dashboard → exchange → marketplace → admin → chibi)
- [ ] Sleep. Seriously. Tired brain = bad answers under pressure.

---

## MORNING OF (2 hours before presentation)

### Step 1: Start the app (30 min before)
```bash
# Terminal 1 — Backend
cd /workspaces/NUverse-Laguna/backend/demo
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

# Terminal 2 — Frontend
cd /workspaces/NUverse-Laguna/frontend
npm run dev
```

### Step 2: Test everything works
- [ ] Open http://localhost:5173
- [ ] Login as student1@students.nu-laguna.edu.ph / Student@12345
  - [ ] Login loading screen (chibi) shows ✓
  - [ ] Dashboard loads with events and listings ✓
  - [ ] Bulldog Exchange opens, sizes show (XS, S, M, L, etc.) ✓
  - [ ] Marketplace loads with listings ✓
  - [ ] Chibi companion visible bottom-right ✓
- [ ] Logout → Login as admin@nu-laguna.edu.ph / Admin@12345
  - [ ] Admin panel accessible ✓
  - [ ] Users tab shows all 5 demo users ✓
  - [ ] Announcements tab works ✓
- [ ] Toggle dark/light mode — both look correct ✓

### Step 3: Prep your browser
- [ ] Open the app in a clean browser window (no other tabs)
- [ ] Already logged OUT — ready for the login demo
- [ ] Zoom browser to 90% so more fits on screen
- [ ] If Codespace: check port 5173 is forwarded and Public

### Step 4: Prep your slides
- [ ] Open slides in presentation mode — ready to go
- [ ] Make sure slide transitions are fast (no fancy delays)
- [ ] Slide 11 (Design Patterns) should have the Strategy Pattern diagram visible

---

## DURING THE PRESENTATION

### Opening (calm down, breathe)
- Stand/sit up straight. Speak clearly and at moderate pace.
- Start with: "Good [morning/afternoon], we're presenting NUverse Laguna..."

### The key moments to nail:

**1. When you explain the Strategy Pattern** (Slide 11)
This is your most important 60 seconds. Say:
> "We have 11 XP sources. Each one awards a different amount. We used the Strategy Pattern — one `XpStrategy` interface, 11 concrete implementations. The factory returns the right one at runtime. Same `award()` call, different behavior. That's polymorphism through Strategy."

**2. When you switch to the live demo**
Say: "Let me show you what this looks like." Open browser. Don't rush.

**3. When demoing Bulldog Exchange**
Click a product → select a size → show the reserve button → say:
> "Each size is its own variant in the database. When reserved, a 48-hour window starts. Sundays don't count. The student gets a printable invoice with a verification code."

**4. When showing Admin panel**
> "Admin can suspend users with a custom duration and reason. When the ban expires, a scheduled background task auto-unsuspends them — that's our async/concurrency feature."

---

## THE DEMO FLOW (5 minutes, keep it tight)

| Step | What to do | What to say | Time |
|---|---|---|---|
| 1 | Login as student | "Notice the loading screen — small UX detail." | 30s |
| 2 | Show dashboard | "Time-aware greeting. Live events and listings." | 30s |
| 3 | Bulldog Exchange | Select product → pick size → show reserve flow | 1 min |
| 4 | Marketplace | Scroll listings → click one → show "Message Seller" | 45s |
| 5 | Admin panel | Switch account → show user management + suspend | 1 min |
| 6 | Chibi page | Click chibi bottom-right → show XP page | 45s |

---

## Q&A — QUICK STRATEGY

1. **Listen to the full question** before answering. Don't rush.
2. **Lead with a one-sentence answer**, then elaborate.
3. **If you don't know** — say "That's a great point. We didn't implement X for this scope, but in production we would handle it by Y."
4. **If they ask to see code** — know the file names. Go to them calmly.
   - XP Strategy: `modules/chibi/domain/XpStrategyFactory.java`
   - Encapsulation: `modules/auth/domain/User.java` → `suspend()` method
   - Abstraction: `modules/bulldog_exchange/application/BulldogExchangeService.java`
   - Event Pattern: `shared/event/` folder + `ChibiXpEventListener.java`
5. **Don't overpromise** — don't say "we have X" if you're not 100% sure X works.

---

## KEY FILES TO KNOW (for when they ask to see code)

| Concept | File |
|---|---|
| Strategy Pattern | `backend/demo/src/main/java/com/nuverse_laguna/modules/chibi/domain/XpStrategyFactory.java` |
| XpStrategy interface | `modules/chibi/domain/XpStrategy.java` |
| Encapsulation | `modules/auth/domain/User.java` → `suspend()`, `reactivate()` |
| Factory Method | `modules/auth/domain/User.java` → `create()` static method |
| Abstraction | `modules/bulldog_exchange/application/BulldogExchangeService.java` |
| Low Coupling / Events | `shared/event/` folder |
| Event Listener | `modules/chibi/application/ChibiXpEventListener.java` |
| Global Error Handler | `shared/exception/GlobalExceptionHandler.java` |
| Layered Architecture | Any `Controller.java` → calls Service → calls Repository |
| Scheduled Tasks | `modules/bulldog_exchange/application/ReservationExpiryScheduler.java` |

---

## IF THINGS GO WRONG

| Problem | Fix |
|---|---|
| App won't load | Check both terminals are running. Refresh. |
| Login fails | Make sure backend started with `dev` profile |
| Feature broken | Stay calm, say "Let me show this feature from the code side instead" |
| Forgot an answer | "Let me think about that — [pause] — here's what I know..." |
| Evaluator throws a curveball | "That's outside our current scope, but we designed for it — here's how we'd handle it..." |

---

## AFTER THE PRESENTATION

- Smile. Thank them.
- Close your laptop calmly.
- Whatever grade you get — you built something real. That matters.

---

## YOUR STAR TALKING POINTS (Top 3)

1. **Strategy Pattern + Polymorphism** — XpStrategyFactory, 11 strategies, same interface
2. **Layered Architecture** — Controller → Service Interface → Impl → Domain → Repository
3. **Event-Driven Low Coupling** — modules communicate through events, not direct calls

Know these three like the back of your hand. If you nail these, you're golden. 🐾
