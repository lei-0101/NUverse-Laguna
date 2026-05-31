# Q&A Preparation — NUverse Laguna
## Every likely question + the answer. Know these cold.

---

## OOP QUESTIONS

**Q: What is encapsulation and where did you apply it?**
> "Encapsulation means bundling data and the methods that operate on it together, and controlling access to internal state. In our project, instead of setting entity fields directly from outside, entities handle their own state changes. For example, `user.suspend(until, reason)` — the User entity updates its own suspended status, increments the suspend count, and stores the reason. The caller doesn't set fields directly. That's encapsulation."

---

**Q: Show me abstraction in your code.**
> "Sure. Every module has a Service Interface and a separate Service Implementation. The controller only depends on the interface. For example, `BulldogExchangeController` only knows `BulldogExchangeService` — the interface. Whether the implementation uses JPA, in-memory storage, or anything else, the controller doesn't care. That separation — hiding the implementation behind an interface — is abstraction."

---

**Q: Where is inheritance used?**
> "Our exception hierarchy uses it — `ResourceNotFoundException` and `BusinessException` both extend `RuntimeException`, and `UnauthorizedException` extends `BusinessException`. This lets our `GlobalExceptionHandler` catch exceptions at different specificity levels. Spring Boot's component model also relies heavily on inheritance under the hood."

---

**Q: Explain polymorphism in your project.**
> "The best example is our XP system. We have an `XpStrategy` interface with one method: `award()`. We have 11 different classes that implement it — `DailyLoginStrategy`, `ListingCreatedStrategy`, `LostFoundPostStrategy`, and so on. Each awards a different amount of XP. The `XpStrategyFactory` returns the right strategy at runtime based on the source. When we call `strategy.award(userId)`, the behavior is different depending on which strategy object we have — same method call, different behavior. That's runtime polymorphism."

---

## SOLID QUESTIONS

**Q: Explain the SOLID principles.**
> "S — Single Responsibility: each class has one job. AuthService handles auth only. ProfileService handles profiles only. O — Open/Closed: our XP system is open for extension. Adding a new XP reward source means adding a new strategy class, not modifying existing ones. L — Liskov Substitution: any service implementation can replace its interface without breaking the system. I — Interface Segregation: our interfaces are focused and small, not bloated. D — Dependency Inversion: controllers depend on service interfaces, not implementations. Spring injects the concrete class at runtime."

---

**Q: Give me an example of Open/Closed principle.**
> "The XP Strategy system. If we want to add a new way to earn XP — say, posting an announcement — we create a new `PostAnnouncementStrategy` class, add one case to the factory, and add the enum value. We never modify existing strategy classes. The system is closed for modification but open for extension."

---

**Q: What is Dependency Inversion?**
> "High-level modules should not depend on low-level modules — both should depend on abstractions. In our project, controllers are high-level, repositories are low-level, and service interfaces are the abstractions in between. The controller declares `private final BulldogExchangeService service` — that's an interface, not the implementation. Spring injects the implementation. If we swap the implementation, the controller code doesn't change."

---

## GRASP QUESTIONS

**Q: What is GRASP?**
> "GRASP stands for General Responsibility Assignment Software Patterns. It's a set of guidelines for assigning responsibilities to classes. We applied several: Information Expert — entities handle their own state. Creator — static factory methods create domain objects. Low Coupling — modules communicate through events, not direct dependencies. High Cohesion — each module package is focused on one area. Controller — Spring MVC controllers only route and delegate."

---

**Q: What is Low Coupling and where is it in your code?**
> "Low coupling means modules don't depend directly on each other. In our project, when a user creates a marketplace listing, the Marketplace module doesn't call the XP module directly. Instead it fires a `MarketplaceListingCreatedEvent`. The XP system listens for that event with `@TransactionalEventListener`. The Marketplace doesn't know the XP module exists. That's low coupling through event-driven design."

---

## DESIGN PATTERN QUESTIONS

**Q: What design patterns did you use?**
> "The main ones: Strategy Pattern for the XP system — 11 strategies implementing one interface. Repository Pattern via Spring Data JPA — abstract data access. Factory Method — entities are created through static factory methods not constructors. Observer/Event Pattern — Spring's `ApplicationEventPublisher` for decoupled cross-module communication. DTO Pattern — all API contracts use separate Request and Response objects, never raw entities."

---

**Q: Explain the Strategy Pattern.**
> "The Strategy Pattern defines a family of algorithms, encapsulates each one, and makes them interchangeable. In our XP system: `XpStrategy` is the interface — one method: `award()`. Each of the 11 XP sources has its own concrete strategy class. The `XpStrategyFactory` returns the right strategy based on the source. The caller just calls `strategy.award(userId)` without knowing which one it got. The behavior varies at runtime — that's the pattern."

---

**Q: Why did you use the Strategy Pattern for the XP system?**
> "Because we have 11 different behaviors — 11 XP sources, each awarding different amounts. Without Strategy, we'd have a giant switch or if-else chain in one place. Every new XP source would require modifying that chain. With Strategy, each behavior is its own class. Adding a new source is adding a new class — not modifying existing ones. It follows Open/Closed and keeps things clean."

---

## ARCHITECTURE QUESTIONS

**Q: Explain your architecture.**
> "We use a layered architecture with module-based packages. Each feature — auth, marketplace, exchange, events — is its own package containing a Controller, a Service Interface, a Service Implementation, Domain Entities, a Repository, and DTOs. The layers go: Controller receives the HTTP request and delegates to the Service. The Service contains business logic and calls the Repository. The Repository handles all database access. Domain Entities carry behavior. DTOs carry data to and from the API. No layer skips another."

---

**Q: Why did you separate Service interfaces from implementations?**
> "Two reasons: abstraction and testability. Controllers depend on the interface, not the implementation, so we can swap implementations without touching the controller. And in tests, we can provide a mock implementation of the service interface without needing a real database. It also enforces the Dependency Inversion principle."

---

**Q: What is a DTO and why did you use them?**
> "DTO means Data Transfer Object. It's a simple object that carries data between layers without exposing internal domain logic. We never return a raw entity from an API endpoint — we always map it to a Response DTO. This protects the domain model from the outside world. If we change the entity structure, we only update the mapper — the API contract in the DTO stays stable."

---

**Q: How does your authentication work?**
> "When a user logs in, we validate credentials, generate a JWT token, and set it as an HTTP-only cookie in the response. HTTP-only means JavaScript can't read the token — this protects against XSS attacks. On every subsequent request, the browser automatically sends the cookie, Spring Security validates the JWT, and the user's role is resolved. We support three roles: Student, Faculty, and Admin, with different access controls per endpoint."

---

## TECHNICAL QUESTIONS

**Q: What is Flyway and why did you use it?**
> "Flyway is a database migration tool. Instead of manually running SQL scripts, every schema change is a versioned migration file — V1 to V25 in our case. When the app starts, Flyway checks which migrations have run and applies the ones that haven't. This means the schema is always in sync with the code, every developer has the same database structure, and you have a full history of every schema change."

---

**Q: Why Spring Boot?**
> "Spring Boot gives us auto-configuration, dependency injection, Spring Security for auth, and Spring Data JPA for database access — all production-ready. It lets us focus on business logic instead of infrastructure setup. The convention-over-configuration approach means less boilerplate."

---

**Q: How did you handle errors?**
> "We have a `GlobalExceptionHandler` using Spring's `@ControllerAdvice`. It catches all exceptions — `ResourceNotFoundException`, `BusinessException`, validation errors from `@Valid`, and authentication errors — and returns consistent error responses with the right HTTP status codes. On the frontend, Zod validates form inputs before they hit the API. Axios interceptors catch API errors and show toast notifications."

---

**Q: Why 219 tests?**
> "We tested both service layer and controller layer for all major modules. Service tests verify business logic in isolation — mocking the repository. Controller tests use Spring MockMvc to test the full HTTP request/response cycle. Having both layers covered means we can refactor confidently. It's also evidence that the features actually work as specified."

---

**Q: What are the scheduled tasks?**
> "Four background jobs using Spring's `@Scheduled`: Suspension Expiry runs every 5 minutes to auto-unsuspend users whose ban has expired. Event Archive runs every 30 minutes to archive events that ended. Reservation Expiry runs hourly to cancel unclaimed reservations. XP events use `@TransactionalEventListener` for post-commit processing. This qualifies as concurrency — we're processing work asynchronously in background threads."

---

**Q: What would you do differently if this were a real production app?**
> "We'd replace console-log email verification with a real SMTP service. We'd move file storage from local disk to cloud storage like Cloudinary or S3 — local disk doesn't scale and resets on server restart. We'd add JWT refresh tokens for longer sessions. We'd configure HTTPS and set the cookie `Secure` flag. And we'd add a proper CI/CD pipeline. We intentionally left these out of scope for the demo, but we know what production would require."

---

## CURVEBALL QUESTIONS

**Q: How is this different from just using Facebook?**
> "Facebook has no campus exclusivity — anyone can join. We restrict registration to `@students.nu-laguna.edu.ph` emails only. Facebook also has no reservation system for official merchandise, no campus event RSVP with capacity tracking, no XP system for engagement, and no role-based controls for faculty and admin. We built features specifically for the NU Laguna community."

**Q: How would this scale to thousands of users?**
> "The architecture is already layered for that. For scaling: we'd add a Redis cache for session management and frequent reads. We'd move to a load-balanced setup behind Nginx. The event-driven design means background processing can be moved to a message queue like RabbitMQ. Database indexes are already on critical query columns."

**Q: What was the hardest part to build?**
> "The XP system — specifically making it event-driven so modules stay decoupled. Getting `@TransactionalEventListener` to work correctly so XP is only awarded after the transaction commits, not if it rolls back — that took debugging. And the Bulldog Chibi character itself was a lot of SVG work."

**Q: Did you work as a team? Who did what?**
> Have a clear answer ready about team division — frontend vs backend, specific modules, etc.
