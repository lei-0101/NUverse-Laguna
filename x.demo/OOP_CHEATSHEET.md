# OOP Cheatsheet — NUverse Laguna
## Quick reference for when they ask "show me X in your code"

---

## THE 4 OOP PILLARS

### ENCAPSULATION
**What it means:** Data and the methods that work on it are bundled together. State changes happen inside the object, not from outside.

**Where in our code:**
```java
// User.java
public void suspend(LocalDateTime until, String reason) {
    this.suspendedUntil = until;
    this.suspensionReason = reason;
    this.suspendCount++;
    this.status = AccountStatus.SUSPENDED;
}

// MarketplaceListing.java
public void markAsSold() {
    this.status = ListingStatus.SOLD;
}

// Reservation.java
public void expire() {
    this.status = ReservationStatus.EXPIRED;
}

// CampusEvent.java
public void archive() {
    this.status = EventStatus.ARCHIVED;
}
```

**What to say:** "We never set fields directly from outside the entity. If a listing is sold, we call `listing.markAsSold()` — the entity handles it. This is encapsulation — data and behavior are together, and state is controlled."

---

### ABSTRACTION
**What it means:** Hide implementation details. Expose only what's necessary.

**Where in our code:**
```java
// BulldogExchangeController.java
// Controller only sees the interface — never the implementation
private final BulldogExchangeService exchangeService;

// BulldogExchangeService.java (interface)
Page<ProductCardResponse> getProducts(...);
ProductResponse getProduct(UUID productId);
ReservationResponse createReservation(UUID userId, UUID variantId);
// ...

// BulldogExchangeServiceImpl.java (implementation)
// The actual logic lives here — 400+ lines — controller doesn't care
```

**What to say:** "The controller calls `exchangeService.getProducts()` — it doesn't know if the data comes from a database, a cache, or anywhere else. The interface abstracts that detail away."

---

### INHERITANCE
**Where in our code:**
```java
// Exception hierarchy
public class ResourceNotFoundException extends RuntimeException { ... }
public class BusinessException extends RuntimeException { ... }
public class UnauthorizedException extends BusinessException { ... }

// All JPA entities use Spring/JPA annotations that build on Java inheritance
// Service implementations extend no class — but inherit through interfaces (interface is the contract)
```

**Also:** Spring Boot itself is heavy on inheritance — `@Component`, `@Service`, `@Repository` all extend Spring's component model.

**What to say:** "Our exception hierarchy uses inheritance — specialized exceptions extend base exceptions, so our GlobalExceptionHandler can catch them at different levels of specificity."

---

### POLYMORPHISM ← STAR TALKING POINT
**What it means:** Same interface, different behavior depending on the actual object at runtime.

**Where in our code:**
```java
// XpStrategy.java (interface)
public interface XpStrategy {
    void award(UUID userId, ChibiXpEventRepository repo, ChibiProfileRepository profileRepo);
}

// XpStrategyFactory.java
public XpStrategy forSource(XpSource source) {
    return switch (source) {
        case DAILY_LOGIN        -> new DailyLoginStrategy();
        case FIRST_LISTING      -> new FirstListingStrategy();
        case LISTING_SOLD       -> new ListingSoldStrategy();
        case LOST_FOUND_POST    -> new LostFoundPostStrategy();
        // ... 11 total strategies
    };
}

// Usage in ChibiXpEventListener.java
XpStrategy strategy = factory.forSource(event.getSource());
strategy.award(event.getUserId(), xpRepo, profileRepo);
// Same call → different XP amount awarded → polymorphism
```

**What to say:** "The XP system uses polymorphism through the Strategy Pattern. All 11 XP sources implement the same `XpStrategy` interface. When `strategy.award()` is called, the actual behavior depends on which strategy object was returned by the factory. Same method call, different behavior — that's runtime polymorphism."

---

## SOLID PRINCIPLES

### S — Single Responsibility
Each class has ONE reason to change.
- `AuthServiceImpl` — only handles login, register, logout, session
- `ProfileServiceImpl` — only handles profile data
- `BulldogExchangeServiceImpl` — only handles exchange/reservation logic
- `NotificationServiceImpl` — only handles notification creation/retrieval

**What to say:** "Every service class has one job. If we need to change how reservations work, we only touch `BulldogExchangeServiceImpl`. We never touch auth."

---

### O — Open/Closed
Open for extension, closed for modification.

**Best example:** XP System
- To add a new XP source (e.g., `POST_ANNOUNCEMENT`), you:
  1. Add the enum value to `XpSource`
  2. Create a new strategy class `PostAnnouncementStrategy`
  3. Add one case to `XpStrategyFactory`
- You NEVER modify existing strategy classes
- You NEVER modify the listener

**What to say:** "The XP system is open for extension. Adding a new reward source doesn't change existing code — we just add a new class."

---

### L — Liskov Substitution
Any implementation can replace its interface without breaking things.

`BulldogExchangeServiceImpl` can be replaced by any other class that implements `BulldogExchangeService` — and the controller would work exactly the same.

---

### I — Interface Segregation
Interfaces are small and focused — not one giant interface.

Each module has its own focused service interface. `BulldogExchangeService` doesn't have methods for announcements. `AnnouncementService` doesn't have methods for marketplace.

---

### D — Dependency Inversion
High-level modules don't depend on low-level modules. Both depend on abstractions.

```java
// Controller (high-level) depends on interface (abstraction)
@RestController
public class BulldogExchangeController {
    private final BulldogExchangeService exchangeService; // interface!
    // Spring injects BulldogExchangeServiceImpl at runtime
}
```

**What to say:** "Controllers never instantiate services. Spring injects the implementation. The controller only knows about the interface — Dependency Inversion in practice."

---

## GRASP PRINCIPLES

| Principle | Our Implementation |
|---|---|
| **Controller** | Spring MVC controllers — only route requests and delegate to services |
| **Information Expert** | Entities own their state changes (`user.suspend()`, `listing.markAsSold()`) |
| **Creator** | Static factory methods: `User.create()`, `MarketplaceListing.create()`, `Reservation.create()` |
| **Low Coupling** | Modules communicate via `ApplicationEventPublisher` — no direct cross-module service dependencies |
| **High Cohesion** | Each module package contains only code related to that module |
| **Pure Fabrication** | DTOs are pure fabrications — they don't represent domain concepts but serve the API contract |
| **Indirection** | Service layer acts as indirection between controllers and repositories |

---

## DESIGN PATTERNS QUICK REFERENCE

### Strategy Pattern
**File:** `modules/chibi/domain/XpStrategyFactory.java` + `XpStrategy.java` + `strategies/` folder
**Purpose:** Different XP reward behavior per source, without if-else chains
**Benefit:** Open for extension — add new source = add new class, don't touch existing

### Repository Pattern
**Files:** All `*Repository.java` files extending `JpaRepository`
**Purpose:** Abstract database access — services never write SQL
**Benefit:** Swap database technology without changing business logic

### Factory Method
**Files:** `User.java`, `MarketplaceListing.java`, `Reservation.java`, `ProductVariant.java`
**Purpose:** Entities created in valid state via static factories
**Benefit:** Can't forget required fields — compilation forces you to provide them

### Observer / Event-Driven
**Files:** `shared/event/` (event records) + `ChibiXpEventListener.java` + `NotificationEventListener.java`
**Purpose:** Cross-module side effects without coupling
**Benefit:** Marketplace fires event → XP system reacts → they don't know about each other

### DTO Pattern
**Files:** All `*Request.java` and `*Response.java` files in `dto/` folders
**Purpose:** Separate API layer from domain layer
**Benefit:** Domain changes don't break API contracts; API changes don't pollute domain

---

## BACKGROUND PROCESSES (Concurrency Bonus)

We have 4 scheduled background tasks — this qualifies for the **Concurrency/Async bonus**:

1. `SuspensionExpiryScheduler` — runs every 5 min, auto-unsuspends expired accounts
2. `EventArchiveScheduler` — runs every 30 min, archives finished events
3. `ReservationExpiryScheduler` — runs every hour, expires unclaimed reservations
4. `ChibiXpEventListener` — uses `@TransactionalEventListener` for async XP processing

**What to say:** "We have background scheduled tasks that run automatically — suspension expiry, event archiving, reservation cleanup. These use Spring's `@Scheduled` annotation with fixed-rate intervals. It's concurrent processing without manual thread management."

---

## IF THEY ASK "WHAT WOULD YOU IMPROVE?"

Good answers:
- "In production we'd replace console-log email with a real SMTP service like Resend"
- "We'd move image storage from local disk to cloud storage like Cloudinary for scalability"
- "We'd add JWT refresh tokens for longer sessions"
- "We could extract the notification system into a microservice for better scalability"

These show you understand production constraints — which is mature thinking.
