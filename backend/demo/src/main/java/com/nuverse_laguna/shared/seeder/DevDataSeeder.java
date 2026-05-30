package com.nuverse_laguna.shared.seeder;

import com.nuverse_laguna.modules.auth.domain.Role;
import com.nuverse_laguna.modules.auth.domain.User;
import com.nuverse_laguna.modules.auth.repository.UserRepository;
import com.nuverse_laguna.modules.bulldog_exchange.domain.MerchandiseCategory;
import com.nuverse_laguna.modules.bulldog_exchange.domain.MerchandiseProduct;
import com.nuverse_laguna.modules.bulldog_exchange.domain.ProductVariant;
import com.nuverse_laguna.modules.bulldog_exchange.repository.MerchandiseProductRepository;
import com.nuverse_laguna.modules.bulldog_exchange.repository.ProductVariantRepository;
import com.nuverse_laguna.modules.events.domain.CampusEvent;
import com.nuverse_laguna.modules.events.domain.EventCategory;
import com.nuverse_laguna.modules.events.repository.CampusEventRepository;
import com.nuverse_laguna.modules.marketplace.domain.ListingCategory;
import com.nuverse_laguna.modules.marketplace.domain.ListingCondition;
import com.nuverse_laguna.modules.marketplace.domain.MarketplaceListing;
import com.nuverse_laguna.modules.marketplace.repository.MarketplaceListingRepository;
import com.nuverse_laguna.modules.profile.domain.UserProfile;
import com.nuverse_laguna.modules.profile.domain.YearLevel;
import com.nuverse_laguna.modules.profile.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Seeds demo data on startup when running under the "dev" Spring profile.
 * Creates demo accounts, sample events, marketplace listings, and exchange products.
 * All accounts are pre-verified (ACTIVE) and ready to log in immediately.
 *
 * Demo accounts:
 *   admin@national-u.edu.ph  / Admin@12345   (ADMIN)
 *   faculty@national-u.edu.ph / Faculty@12345 (FACULTY)
 *   student1@national-u.edu.ph / Student@12345 (STUDENT)
 *   student2@national-u.edu.ph / Student@12345 (STUDENT)
 *   student3@national-u.edu.ph / Student@12345 (STUDENT)
 */
@Component
@Profile("dev")
@RequiredArgsConstructor
@Slf4j
public class DevDataSeeder implements ApplicationRunner {

    private final UserRepository userRepository;
    private final UserProfileRepository profileRepository;
    private final MarketplaceListingRepository listingRepository;
    private final CampusEventRepository eventRepository;
    private final MerchandiseProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (userRepository.existsByEmail("admin@national-u.edu.ph")) {
            log.info("[DevDataSeeder] Seed data already present — skipping.");
            return;
        }

        log.info("[DevDataSeeder] Seeding demo data…");

        // ── Users ────────────────────────────────────────────────────────────
        User admin   = seedUser("admin@national-u.edu.ph",   "Admin@12345",   "Admin Reyes",      Role.ROLE_ADMIN);
        User faculty = seedUser("faculty@national-u.edu.ph", "Faculty@12345", "Prof. Maria Santos", Role.ROLE_FACULTY);
        User s1      = seedUser("student1@national-u.edu.ph", "Student@12345", "Alex Dela Cruz",   Role.ROLE_STUDENT);
        User s2      = seedUser("student2@national-u.edu.ph", "Student@12345", "Jamie Reyes",      Role.ROLE_STUDENT);
        User s3      = seedUser("student3@national-u.edu.ph", "Student@12345", "Sam Villanueva",   Role.ROLE_STUDENT);

        // ── Profiles ─────────────────────────────────────────────────────────
        seedProfile(admin.getId(),   "Admin Reyes",         "BSIT", YearLevel.FOURTH,
                "System administrator for NUverse Laguna.", "tech, systems, campus life");
        seedProfile(faculty.getId(), "Prof. Maria Santos",  "Computer Science Department", null,
                "Faculty member and NUverse coordinator.", "education, research, technology");
        seedProfile(s1.getId(),      "Alex Dela Cruz",      "BS Information Technology", YearLevel.SECOND,
                "Tech enthusiast, loves gaming and campus events.", "coding, gaming, basketball");
        seedProfile(s2.getId(),      "Jamie Reyes",         "BS Computer Science", YearLevel.THIRD,
                "Design lover and community volunteer.", "design, art, music, volunteering");
        seedProfile(s3.getId(),      "Sam Villanueva",      "BS Information Systems", YearLevel.FIRST,
                "First-year student exploring everything NUverse has to offer.", "sports, movies, food");

        // ── Campus Events ────────────────────────────────────────────────────
        seedEvent(faculty.getId(),
                "NU Laguna Tech Summit 2026",
                "Join us for the biggest campus technology summit of the year! " +
                "Featuring keynote speakers, workshops on AI, cybersecurity, and web development, " +
                "plus a hackathon with exciting prizes.",
                EventCategory.SEMINAR,
                "NU Laguna Multi-Purpose Hall, 3rd Floor",
                LocalDateTime.now().plusDays(7),
                LocalDateTime.now().plusDays(7).plusHours(8),
                200);

        seedEvent(faculty.getId(),
                "Bulldog Culture Fest 2026",
                "Celebrate NU Laguna's rich culture with live performances, food booths, " +
                "art exhibits, and cultural shows representing the diverse backgrounds " +
                "of our campus community. Everyone is welcome!",
                EventCategory.CULTURAL,
                "NU Laguna Quadrangle",
                LocalDateTime.now().plusDays(14),
                LocalDateTime.now().plusDays(14).plusHours(10),
                500);

        seedEvent(admin.getId(),
                "Intramurals Opening Ceremony",
                "The NU Laguna Intramurals is finally here! Witness the parade of athletes, " +
                "the lighting of the torch, and the opening match of the season. " +
                "Cheer for your department!",
                EventCategory.SPORTS,
                "NU Laguna Covered Court",
                LocalDateTime.now().plusDays(3),
                LocalDateTime.now().plusDays(3).plusHours(4),
                300);

        seedEvent(faculty.getId(),
                "Career & Industry Expo",
                "Meet representatives from top companies in the IT and business sectors. " +
                "Submit your resume, attend mock interviews, and get one step closer to " +
                "your dream internship or first job.",
                EventCategory.ACADEMIC,
                "NU Laguna Function Hall, 2nd Floor",
                LocalDateTime.now().plusDays(21),
                LocalDateTime.now().plusDays(21).plusHours(7),
                150);

        seedEvent(s1.getId(),
                "CS + IT Night Out: Welcome Party",
                "A laid-back social night for all CICS students! Get to know your classmates, " +
                "play games, and enjoy free snacks. New students especially welcome.",
                EventCategory.SOCIAL,
                "NU Laguna Rooftop Garden",
                LocalDateTime.now().plusDays(5),
                LocalDateTime.now().plusDays(5).plusHours(3),
                80);

        // ── Marketplace Listings ──────────────────────────────────────────────
        seedListing(s1.getId(),
                "Calculus Early Transcendentals 8th Ed.",
                "Barely used — only one semester. Highlights on some chapters but no written notes. " +
                "Perfect for BSIT/BSCS Math subjects. Includes solution manual.",
                new BigDecimal("350.00"), ListingCategory.BOOKS, ListingCondition.GOOD);

        seedListing(s2.getId(),
                "Logitech G502 Gaming Mouse",
                "Selling my Logitech G502 Hero — moving to laptop. Still works perfectly, " +
                "side weights included, original USB receiver intact. " +
                "Minor scuff on left button. No lowball offers.",
                new BigDecimal("1200.00"), ListingCategory.GADGETS, ListingCondition.GOOD);

        seedListing(s3.getId(),
                "NU Laguna PE Uniform (Large)",
                "Complete PE uniform set — polo and shorts, both Large size. " +
                "Worn twice. Washed and ready to go. Perfect for incoming freshmen.",
                new BigDecimal("250.00"), ListingCategory.UNIFORMS, ListingCondition.LIKE_NEW);

        seedListing(s1.getId(),
                "Drawing Tablet — Wacom Intuus S",
                "Wacom Intuus S, used for one year for digital art and design subjects. " +
                "All original accessories included (pen, nibs, USB cable, clip). " +
                "Works flawlessly on Windows and Mac.",
                new BigDecimal("1800.00"), ListingCategory.GADGETS, ListingCondition.GOOD);

        seedListing(s2.getId(),
                "Complete BSCS Year 1 Books Bundle",
                "Selling my entire first-year CS book bundle: Discrete Math, " +
                "Programming Logic & Design, Computer Fundamentals, and more. " +
                "Buy all together for a huge discount!",
                new BigDecimal("900.00"), ListingCategory.BOOKS, ListingCondition.FAIR);

        seedListing(s3.getId(),
                "Portable Laptop Stand (Adjustable)",
                "Aluminum adjustable laptop stand — folds flat for easy transport. " +
                "Compatible with 10-17 inch laptops. Like new, used for one semester only.",
                new BigDecimal("400.00"), ListingCategory.GADGETS, ListingCondition.LIKE_NEW);

        seedListing(s1.getId(),
                "Art Commission — Digital Portrait",
                "Offering digital portrait commissions! " +
                "Anime or semi-realistic style. Price: ₱350 for bust-up, ₱600 for full body. " +
                "2–3 day turnaround. DM to discuss details. Samples available on request.",
                new BigDecimal("350.00"), ListingCategory.ART_COMMISSIONS, ListingCondition.NEW);

        // ── Bulldog Exchange Products ─────────────────────────────────────────
        MerchandiseProduct polo = seedProduct(
                "NU Laguna Bulldogs Polo Shirt",
                "Official NU Laguna polo shirt. Made from breathable cotton-polyester blend. " +
                "Features the Bulldog crest embroidered on the chest. Perfect for school wear and alumni events.",
                MerchandiseCategory.CLOTHING);

        seedVariant(polo, "S",  "Royal Blue", "POLO-S-BLUE",  20, new BigDecimal("450.00"));
        seedVariant(polo, "M",  "Royal Blue", "POLO-M-BLUE",  35, new BigDecimal("450.00"));
        seedVariant(polo, "L",  "Royal Blue", "POLO-L-BLUE",  30, new BigDecimal("450.00"));
        seedVariant(polo, "XL", "Royal Blue", "POLO-XL-BLUE", 15, new BigDecimal("450.00"));

        MerchandiseProduct hoodie = seedProduct(
                "NUverse Bulldog Hoodie",
                "Premium campus hoodie — thick fleece interior, kangaroo pocket, " +
                "and embroidered NUverse logo on the back. Limited edition release. " +
                "Sizes run slightly large.",
                MerchandiseCategory.CLOTHING);

        seedVariant(hoodie, "M",  "Navy",  "HOODIE-M-NAVY",  10, new BigDecimal("850.00"));
        seedVariant(hoodie, "L",  "Navy",  "HOODIE-L-NAVY",  12, new BigDecimal("850.00"));
        seedVariant(hoodie, "XL", "Navy",  "HOODIE-XL-NAVY",  8, new BigDecimal("850.00"));
        seedVariant(hoodie, "M",  "Black", "HOODIE-M-BLACK",  6, new BigDecimal("850.00"));
        seedVariant(hoodie, "L",  "Black", "HOODIE-L-BLACK",  5, new BigDecimal("850.00"));

        MerchandiseProduct tote = seedProduct(
                "NUverse Tote Bag",
                "Canvas tote bag with the NU Laguna campus map print. " +
                "Extra-large size — fits A4 notebooks, water bottle, and laptop. " +
                "Reinforced handles. A campus staple.",
                MerchandiseCategory.BAGS);

        seedVariant(tote, null, "Natural Canvas",  "TOTE-NATURAL", 50, new BigDecimal("280.00"));
        seedVariant(tote, null, "Midnight Black",  "TOTE-BLACK",   40, new BigDecimal("280.00"));

        MerchandiseProduct cap = seedProduct(
                "NU Bulldogs Snapback Cap",
                "Structured snapback cap with embroidered Bulldog logo. " +
                "One size fits all with adjustable snap closure. " +
                "Available in school colors.",
                MerchandiseCategory.ACCESSORIES);

        seedVariant(cap, "One Size", "Royal Blue", "CAP-BLUE",  25, new BigDecimal("320.00"));
        seedVariant(cap, "One Size", "Black",      "CAP-BLACK", 20, new BigDecimal("320.00"));

        MerchandiseProduct notebook = seedProduct(
                "NUverse Spiral Notebook (3-pack)",
                "Official NUverse branded spiral notebooks — 80 pages each, " +
                "college-ruled. Cover features the campus landmark illustration. " +
                "Perfect for every class.",
                MerchandiseCategory.STATIONERY);

        seedVariant(notebook, null, "Mixed Covers", "NB-3PACK", 100, new BigDecimal("120.00"));

        log.info("[DevDataSeeder] Seed complete — {} users, 5 events, 7 listings, 5 exchange products.",
                5);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private User seedUser(String email, String rawPassword, String fullName, Role role) {
        User user = User.createSeeded(email, passwordEncoder.encode(rawPassword), fullName, role);
        return userRepository.save(user);
    }

    private void seedProfile(UUID userId, String fullName, String course,
                              YearLevel yearLevel, String bio, String interests) {
        UserProfile profile = UserProfile.createFor(userId, fullName);
        profile.updateDetails(fullName, bio, course, yearLevel, interests);
        profileRepository.save(profile);
    }

    private void seedEvent(UUID creatorId, String title, String description,
                            EventCategory category, String location,
                            LocalDateTime start, LocalDateTime end, int capacity) {
        CampusEvent event = CampusEvent.create(creatorId, title, description,
                category, location, start, end, null, capacity);
        event.publish();
        eventRepository.save(event);
    }

    private void seedListing(UUID sellerId, String title, String description,
                              BigDecimal price, ListingCategory category, ListingCondition condition) {
        MarketplaceListing listing = MarketplaceListing.create(sellerId, title, description,
                price, category, condition);
        listingRepository.save(listing);
    }

    private MerchandiseProduct seedProduct(String name, String description,
                                            MerchandiseCategory category) {
        MerchandiseProduct product = MerchandiseProduct.create(name, description, null, category);
        return productRepository.save(product);
    }

    private void seedVariant(MerchandiseProduct product, String size, String color,
                              String sku, int stock, BigDecimal price) {
        ProductVariant variant = ProductVariant.create(product, size, color, sku, stock, price);
        variantRepository.save(variant);
    }
}
