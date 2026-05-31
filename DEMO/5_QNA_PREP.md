# Q&A Preparation — NUverse Laguna
## Every likely question + the exact answer. Know these.

---

## OOP QUESTIONS

**Q: What is encapsulation and where did you use it?**
> "Encapsulation means an object controls its own state — nothing reaches in and changes its fields from outside. In our project, when we suspend a user, we call `user.suspend()` — the User entity updates its own status, increments the count, stores the reason. We don't set those fields from outside. Same with `listing.markAsSold()`, `reservation.expire()`. The object does the work."

**Q: Show me abstraction in your code.**
> "Every module has a Service Interface and a separate Implementation. The Controller only depends on the interface. `BulldogExchangeController` calls `exchangeService.getProducts()` — it doesn't know how those products are fetched or mapped. That 400-line implementation is hidden behind a simple interface. That's abstraction."

**Q: Where do you use inheritance?**
> "Our exception hierarchy. `ResourceNotFoundException` and `BusinessException` both extend `RuntimeException`. `UnauthorizedException` extends `BusinessException`. Our `GlobalExceptionHandler` catches them at different levels — specific types first, then general. We also inherit from Spring's component model throughout."

**Q: Explain polymorphism in your project.**
> "The XP system. We have an `XpStrategy` interface with one method: `award()`. We have 11 classes implementing it — each gives different XP. The `XpStrategyFactory` returns the right strategy based on the action. When we call `strategy.award(userId)`, the behavior is different depending on which strategy object we have. Same method call, different behavior. That's runtime polymorphism."

---

## SOLID QUESTIONS

**Q: Explain SOLID.**
> "S — each class has one job. O — our XP system is open for new actions without touching existing code. L — any service implementation can replace its interface without breaking anything. I — interfaces are small and focused. D — controllers depend on interfaces, Spring injects the implementation."

**Q: Give me an example of Open/Closed.**
> "The XP Strategy system. To add a new way to earn XP, we create one new strategy class and add one case to the factory. We never modify the 11 existing strategies. Open for extension, closed for modification."

**Q: What is Dependency Inversion?**
> "Controllers depend on service interfaces, not the concrete class. The controller declares `BulldogExchangeService` — that's an interface. Spring injects the real implementation at runtime. The controller never creates the service itself."

---

## GRASP QUESTIONS

**Q: What is GRASP?**
> "GRASP is a set of guidelines for assigning responsibilities to classes. We applied Information Expert — entities handle their own state. Creator — factory methods create objects. Controller — Spring MVC controllers only route and delegate. Low Coupling — modules communicate through events. High Cohesion — each module stays focused on its area."

**Q: What is Low Coupling and where is it?**
> "When a listing is created, Marketplace fires a `MarketplaceListingCreatedEvent`. The XP system listens for it and awards XP. Marketplace doesn't know XP exists. Remove the XP system — Marketplace still works. That's low coupling through event-driven design."

---

## DESIGN PATTERN QUESTIONS

**Q: What design patterns did you use?**
> "Strategy Pattern for the XP system — 11 strategies, one interface. Repository Pattern through Spring Data JPA. Factory Method — `User.create()`, `Reservation.create()`. Observer/Event Pattern — Spring ApplicationEventPublisher for cross-module communication. DTO Pattern — all API contracts use separate request and response objects."

**Q: Explain the Strategy Pattern.**
> "One interface, multiple implementations. `XpStrategy` has one method: `award()`. Each XP source — daily login, listing created, event RSVP — has its own class implementing that interface. A factory returns the right one. The caller just calls `award()` without knowing which strategy it got. Add a new XP source — add one new class, nothing else changes."

**Q: Why did you use Strategy Pattern for XP?**
> "Without it, we'd have an if-else chain for 11 conditions. Every new action means editing that chain — risky. With Strategy, each behavior is isolated in its own class. New action = new class. Old code untouched. Follows Open/Closed."

---

## ARCHITECTURE QUESTIONS

**Q: Explain your architecture.**
> "Layered architecture with module-based packages. Each feature has a Controller, Service Interface, Service Implementation, Domain Entity, Repository, and DTOs — all in its own module package. Controller receives the request, Service handles the logic, Repository handles the database. No layer skips another. Separation of concerns enforced through structure."

**Q: Why did you separate Service interfaces from implementations?**
> "Two reasons — abstraction and testability. Controllers depend on the interface so we can swap implementations without touching the controller. In tests, we can mock the interface without a real database. And it enforces Dependency Inversion."

**Q: What is a DTO?**
> "Data Transfer Object. A simple class that carries data between layers. We never expose raw domain entities through the API — we always map to a Response DTO. If the entity structure changes, we only update the mapper. The API contract in the DTO stays stable."

---

## TECHNICAL QUESTIONS

**Q: How does authentication work?**
> "User logs in, we validate credentials, generate a JWT token, set it as an HTTP-only cookie. HTTP-only means JavaScript can't read the token — protects against XSS. On every request, the browser sends the cookie automatically, Spring Security validates the JWT and resolves the user's role. Three roles: Student, Faculty, Admin, with different permissions."

**Q: What is Flyway?**
> "A database migration tool. Every schema change is a numbered SQL file — V1 to V25. On startup, Flyway checks which migrations have run and applies new ones. The schema is always in sync with the code, and there's a full history of every change."

**Q: How did you handle errors?**
> "`GlobalExceptionHandler` catches all exceptions and returns consistent API responses. 12 exception types handled — from validation errors to auth failures. On the frontend, Zod validates forms before they hit the API. Axios interceptors show error toasts globally."

**Q: Why 219 tests?**
> "We tested both the service layer and controller layer for all major modules. Service tests check business logic in isolation using mocks. Controller tests use Spring MockMvc to test the full HTTP request/response cycle. That coverage means we can change code without guessing whether something broke."

**Q: What are the background tasks?**
> "Four scheduled jobs using Spring `@Scheduled`. Suspension expiry every 5 minutes. Event archive every 30 minutes. Reservation expiry every hour. XP events processed post-transaction with `@TransactionalEventListener`. Background threads, automatic — that's our concurrency feature."

---

## CURVEBALL QUESTIONS

**Q: How is this different from just using Facebook?**
> "Facebook isn't campus-exclusive. Anyone can join. We restrict registration to `@students.nu-laguna.edu.ph` only. Facebook has no official merchandise reservation system, no capacity-tracked event RSVP, no role-based faculty controls, no XP system. We built specifically for NU Laguna."

**Q: How would this scale?**
> "The layered architecture is already designed for it. We'd add Redis for caching, move file storage to S3, put the app behind a load balancer. The event-driven design means background processing could move to a message queue like RabbitMQ. Database indexes are already on all critical columns."

**Q: What would you improve if you had more time?**
> "Real SMTP email for verification. Cloud file storage instead of local disk. JWT refresh tokens for longer sessions. HTTPS with secure cookie flags. Possibly extract the notification system into a microservice. We made all these intentional trade-offs for the demo scope."

**Q: Did you use AI?**
> Be honest about your process. If you used AI tools to help, say how — for generating boilerplate, suggestions, code review. Evaluators appreciate honesty over evasion.

---

## QUICK TIPS FOR Q&A

1. **Listen to the full question** before you start answering.
2. **Lead with a one-sentence answer**, then expand.
3. **If you don't know** — say: *"That's outside our current scope, but in production we'd handle it by..."*
4. **If asked to show code** — go to the file calmly. Know the locations from the cheatsheet above.
5. **Don't rush.** Silence before answering shows you're thinking, not panicking.
