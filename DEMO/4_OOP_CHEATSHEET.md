# OOP Cheatsheet — NUverse Laguna
## "Show me X in your code" — Know these cold.

---

## ENCAPSULATION

**Simple version:** Objects control their own state. Nothing changes their fields from outside.

**Where:** `User.java`, `MarketplaceListing.java`, `Reservation.java`, `CampusEvent.java`

**Show this code:**
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
```

**Say:** *"We never set entity fields directly from outside. State changes happen inside the entity through behavior methods. That's encapsulation."*

---

## ABSTRACTION

**Simple version:** Hide complexity. Show only what's needed.

**Where:** Every `*Service.java` interface + `*ServiceImpl.java` pair

**Show this:**
```java
// BulldogExchangeController.java — only sees the interface
private final BulldogExchangeService exchangeService; // ← interface!

// BulldogExchangeService.java — the interface (simple)
Page<ProductCardResponse> getProducts(...);
ProductResponse getProduct(UUID productId);
ReservationResponse createReservation(UUID userId, UUID variantId);

// BulldogExchangeServiceImpl.java — actual logic (400+ lines, hidden)
```

**Say:** *"The controller calls `exchangeService.getProducts()` — it doesn't know how the products are fetched, filtered, or mapped. That complexity is hidden behind the interface. That's abstraction."*

---

## INHERITANCE

**Where:** Exception hierarchy + Spring component model

**Show this:**
```java
// shared/exception/
ResourceNotFoundException extends RuntimeException
BusinessException extends RuntimeException
UnauthorizedException extends BusinessException
```

**Say:** *"Our custom exceptions build on Java's base exceptions using inheritance. Our global error handler can catch them at different levels — specific types first, then general RuntimeException as fallback."*

---

## POLYMORPHISM ← YOUR BEST ANSWER

**Where:** `XpStrategyFactory.java` + strategy classes in `modules/chibi/domain/strategies/`

**Show this:**
```java
// XpStrategy.java — one interface
public interface XpStrategy {
    void award(UUID userId, ...);
}

// XpStrategyFactory.java
public XpStrategy forSource(XpSource source) {
    return switch (source) {
        case DAILY_LOGIN     -> new DailyLoginStrategy();
        case FIRST_LISTING   -> new FirstListingStrategy();
        case EVENT_RSVP      -> new EventRsvpStrategy();
        // ... 11 total
    };
}

// Usage — same call, different behavior
XpStrategy strategy = factory.forSource(event.getSource());
strategy.award(userId, ...); // ← polymorphism
```

**Say:** *"This is runtime polymorphism. The caller calls `award()` on whatever strategy it gets back. Each strategy class implements it differently — different XP amount. Same method call, different behavior depending on the object. That's polymorphism."*

---

## SOLID — ONE-LINE ANSWERS

**S:** *"Each class has one job. AuthService handles auth only. ProfileService handles profiles only."*

**O:** *"To add a new XP source, we add one new strategy class. We never touch existing classes. Open for extension, closed for modification."*

**L:** *"Any service implementation can swap in for its interface without breaking the controller."*

**I:** *"Service interfaces are small and focused — only the methods for their module."*

**D:** *"Controllers depend on interfaces, not concrete classes. Spring injects the real implementation at runtime."*

---

## GRASP — ONE-LINE ANSWERS

**Controller:** *"Spring MVC controllers receive requests and delegate to services — that's their only job."*

**Information Expert:** *"The entity that owns the data handles the behavior — `user.suspend()`, not external code."*

**Creator:** *"Static factory methods create objects: `User.create()`, `Reservation.create()`."*

**Low Coupling:** *"Modules fire Spring events, never call each other directly. Remove one module — others still work."*

**High Cohesion:** *"Each module package contains only code for that one feature area."*

---

## DESIGN PATTERNS — QUICK ANSWERS

**Strategy:** *"One interface, multiple implementations. XP system has 11 strategies. Add new source = add new class. Never touch existing ones."*

**Repository:** *"Spring Data JPA repositories abstract all database access. Services never write raw SQL."*

**Factory Method:** *"`User.create()`, `Reservation.create()` — static factory methods ensure objects are always created in a valid state."*

**Observer/Events:** *"Spring `ApplicationEventPublisher` fires events across modules. XP system listens for marketplace events. They don't depend on each other."*

**DTO:** *"Request and Response DTOs separate the API from the domain. Entities never go directly into API responses."*

---

## KEY FILE LOCATIONS (When They Say "Show Me")

| What | File Path (from backend/src/main/java/) |
|---|---|
| Strategy Pattern | `modules/chibi/domain/XpStrategyFactory.java` |
| XpStrategy interface | `modules/chibi/domain/XpStrategy.java` |
| Encapsulation | `modules/auth/domain/User.java` → `suspend()` |
| Factory Method | `modules/auth/domain/User.java` → `create()` |
| Abstraction | `modules/bulldog_exchange/application/BulldogExchangeService.java` |
| Low Coupling / Events | `shared/event/` folder |
| Event Listener | `modules/chibi/application/ChibiXpEventListener.java` |
| Global Error Handler | `shared/handler/GlobalExceptionHandler.java` |
| Layered structure | Any module: Controller → Service → Impl → Domain → Repository |
| Schedulers (concurrency) | `modules/bulldog_exchange/application/ReservationExpiryScheduler.java` |

---

## BACKGROUND TASKS = CONCURRENCY BONUS

We have 4 `@Scheduled` tasks:
1. `SuspensionExpiryScheduler` — every 5 min, auto-unsuspends expired bans
2. `EventArchiveScheduler` — every 30 min, archives finished events
3. `ReservationExpiryScheduler` — every hour, cancels unclaimed reservations
4. `@TransactionalEventListener` on XP — async post-transaction XP processing

**Say:** *"These run on background threads automatically using Spring's `@Scheduled` annotation. Concurrent background processing without manual thread management — that's our async/concurrency feature."*

---

## "WHAT WOULD YOU DO DIFFERENTLY?" (Good answer)

> "In production we'd use a real SMTP service for email verification instead of logging to console. We'd move file storage to Cloudinary or S3 — local disk doesn't scale. We'd add JWT refresh tokens for longer sessions and configure HTTPS with secure cookie flags. These were intentionally out of scope for this demo, but we know exactly what production would require."
