package com.nuverse_laguna.shared.seeder;

import com.nuverse_laguna.modules.announcements.domain.AnnouncementPriority;
import com.nuverse_laguna.modules.announcements.domain.EmergencyAnnouncement;
import com.nuverse_laguna.modules.announcements.repository.AnnouncementRepository;
import com.nuverse_laguna.modules.auth.domain.Role;
import com.nuverse_laguna.modules.auth.domain.User;
import com.nuverse_laguna.modules.auth.repository.UserRepository;
import com.nuverse_laguna.modules.bulldog_exchange.domain.MerchandiseCategory;
import com.nuverse_laguna.modules.bulldog_exchange.domain.MerchandiseGender;
import com.nuverse_laguna.modules.bulldog_exchange.domain.MerchandiseProduct;
import com.nuverse_laguna.modules.bulldog_exchange.domain.ProductVariant;
import com.nuverse_laguna.modules.bulldog_exchange.repository.MerchandiseProductRepository;
import com.nuverse_laguna.modules.bulldog_exchange.repository.ProductVariantRepository;
import com.nuverse_laguna.modules.events.domain.CampusEvent;
import com.nuverse_laguna.modules.events.domain.EventCategory;
import com.nuverse_laguna.modules.events.repository.CampusEventRepository;
import com.nuverse_laguna.modules.lostfound.domain.ItemType;
import com.nuverse_laguna.modules.lostfound.domain.LostFoundItem;
import com.nuverse_laguna.modules.lostfound.repository.LostFoundRepository;
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
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Seeds demo data on startup when running under the "dev" Spring profile.
 * Creates demo accounts, sample events, marketplace listings, and exchange products.
 * All accounts are pre-verified (ACTIVE) and ready to log in immediately.
 *
 * Demo accounts:
 *   admin@nu-laguna.edu.ph  / Admin@12345   (ADMIN)
 *   faculty@nu-laguna.edu.ph / Faculty@12345 (FACULTY)
 *   student1@students.nu-laguna.edu.ph / Student@12345 (STUDENT)
 *   student2@students.nu-laguna.edu.ph / Student@12345 (STUDENT)
 *   student3@students.nu-laguna.edu.ph / Student@12345 (STUDENT)
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
    private final AnnouncementRepository announcementRepository;
    private final LostFoundRepository lostFoundRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (userRepository.existsByEmail("admin@nu-laguna.edu.ph")) {
            log.info("[DevDataSeeder] Seed data already present — skipping.");
            return;
        }

        log.info("[DevDataSeeder] Seeding demo data…");

        // ── Users ────────────────────────────────────────────────────────────
        User admin   = seedUser("admin@nu-laguna.edu.ph",   "Admin@12345",   "Admin Reyes",      Role.ROLE_ADMIN);
        User faculty = seedUser("faculty@nu-laguna.edu.ph", "Faculty@12345", "Prof. Maria Santos", Role.ROLE_FACULTY);
        User s1      = seedUser("student1@students.nu-laguna.edu.ph", "Student@12345", "Alex Dela Cruz",   Role.ROLE_STUDENT);
        User s2      = seedUser("student2@students.nu-laguna.edu.ph", "Student@12345", "Jamie Reyes",      Role.ROLE_STUDENT);
        User s3      = seedUser("student3@students.nu-laguna.edu.ph", "Student@12345", "Sam Villanueva",   Role.ROLE_STUDENT);

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

        // ── Bulldog Exchange: Bags ────────────────────────────────────────────
        MerchandiseProduct drawstringBag = seedProduct(
                "NU Drawstring Bag",
                "Official NU Laguna drawstring bag. Capacity: 20L. Size: 48.5 × 40 cm. " +
                "Lightweight and durable — perfect for campus, gym, and field trips.",
                MerchandiseCategory.BAGS);
        seedVariant(drawstringBag, null, "Black", "BAG-BLACK", 30, new BigDecimal("299.00"));
        seedVariant(drawstringBag, null, "Blue",  "BAG-BLUE",  30, new BigDecimal("299.00"));

        // ── Bulldog Exchange: Apparel ─────────────────────────────────────────
        MerchandiseProduct jacket = seedProduct(
                "NU Pullover Jacket Hood with Combi NU Gold",
                "Official NU Laguna pullover hoodie jacket with Combi NU Gold accent. " +
                "Available in two color variants (Blue, Yellow). Sizes XS to XL.",
                MerchandiseCategory.CLOTHING);
        for (String sz : new String[]{"XS", "S", "M", "L", "XL"}) {
            seedVariant(jacket, sz, "Blue",   "JACKET-" + sz + "-BLUE",   15, new BigDecimal("799.00"));
            seedVariant(jacket, sz, "Yellow", "JACKET-" + sz + "-YELLOW", 15, new BigDecimal("799.00"));
        }

        // Size arrays for individual size seeding
        String[] stdSizes = {"XS", "S", "M", "L", "XL", "2XL", "3XL"};
        String[] extSizes = {"4XL", "5XL", "6XL"};
        String[] allSizes = {"XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"};
        String[] fullSizes = {"XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL", "6XL"};

        // ── Bulldog Exchange: Official Uniforms — Psychology (College) ──────
        MerchandiseProduct psychMaleTop = seedProduct(
                "Male Psychology Uniform Top",
                "[College] Official NU Laguna Male Psychology Uniform polo shirt. " +
                "White with gold pocket piping. 1st to 4th year.",
                MerchandiseCategory.CLOTHING, MerchandiseGender.MALE);
        seedVariantSizes(psychMaleTop, stdSizes, "White", "PSYCH-M-T", 3, new BigDecimal("700.00"));
        seedVariantSizes(psychMaleTop, extSizes, "White", "PSYCH-M-T", 2, new BigDecimal("950.00"));

        MerchandiseProduct psychMaleBottom = seedProduct(
                "Male Psychology Uniform Bottom",
                "[College] Official NU Laguna Male Psychology Uniform white pants. 1st to 4th year.",
                MerchandiseCategory.CLOTHING, MerchandiseGender.MALE);
        seedVariantSizes(psychMaleBottom, stdSizes, "White", "PSYCH-M-B", 3, new BigDecimal("700.00"));
        seedVariantSizes(psychMaleBottom, extSizes, "White", "PSYCH-M-B", 2, new BigDecimal("850.00"));

        MerchandiseProduct psychFemaleTop = seedProduct(
                "Female Psychology Uniform Top",
                "[College] Official NU Laguna Female Psychology Uniform blouse. " +
                "White with mustard pocket piping. 1st to 4th year.",
                MerchandiseCategory.CLOTHING, MerchandiseGender.FEMALE);
        seedVariantSizes(psychFemaleTop, stdSizes, "White", "PSYCH-F-T", 3, new BigDecimal("700.00"));
        seedVariantSizes(psychFemaleTop, extSizes, "White", "PSYCH-F-T", 2, new BigDecimal("850.00"));

        MerchandiseProduct psychFemaleBottom = seedProduct(
                "Female Psychology Uniform Bottom",
                "[College] Official NU Laguna Female Psychology Uniform white pants. 3rd to 4th year.",
                MerchandiseCategory.CLOTHING, MerchandiseGender.FEMALE);
        seedVariantSizes(psychFemaleBottom, stdSizes, "White", "PSYCH-F-B", 3, new BigDecimal("700.00"));
        seedVariantSizes(psychFemaleBottom, extSizes, "White", "PSYCH-F-B", 1, new BigDecimal("850.00"));

        // ── Bulldog Exchange: Official Uniforms — NSTP ───────────────────────
        MerchandiseProduct nstpShirt = seedProduct(
                "NSTP Shirt",
                "[College] Official NSTP uniform shirt. White, no-dim fabric. Sizes XS to 4XL.",
                MerchandiseCategory.CLOTHING, MerchandiseGender.UNISEX);
        seedVariantSizes(nstpShirt, allSizes, "White", "NSTP-T", 5, new BigDecimal("300.00"));

        MerchandiseProduct nstpPants = seedProduct(
                "NSTP Jogging Pants",
                "[College] Official NSTP uniform jogging pants. Navy blue, no-dim fabric. Sizes XS to 4XL.",
                MerchandiseCategory.CLOTHING, MerchandiseGender.UNISEX);
        seedVariantSizes(nstpPants, allSizes, "Navy Blue", "NSTP-B", 5, new BigDecimal("400.00"));

        // ── Bulldog Exchange: Official Uniforms — ESS (College) ──────────────
        MerchandiseProduct essMalePolo = seedProduct(
                "ESS Male Polo Shirt",
                "[College] Official ESS uniform polo shirt for male students. 1st to 4th year. Sizes XS to 6XL.",
                MerchandiseCategory.CLOTHING, MerchandiseGender.MALE);
        seedVariantSizes(essMalePolo, fullSizes, null, "ESS-M-P", 3, new BigDecimal("600.00"));

        MerchandiseProduct essMaleKhaki = seedProduct(
                "ESS Male Khaki Short",
                "[College] Official ESS uniform khaki shorts for male students. 1st to 4th year. Sizes XS to 6XL.",
                MerchandiseCategory.CLOTHING, MerchandiseGender.MALE);
        seedVariantSizes(essMaleKhaki, fullSizes, "Khaki", "ESS-M-K", 3, new BigDecimal("600.00"));

        MerchandiseProduct essFemalePolo = seedProduct(
                "ESS Female Polo Shirt",
                "[College] Official ESS uniform polo shirt for female students. 1st to 4th year. Sizes XS to 6XL.",
                MerchandiseCategory.CLOTHING, MerchandiseGender.FEMALE);
        seedVariantSizes(essFemalePolo, fullSizes, null, "ESS-F-P", 3, new BigDecimal("600.00"));

        MerchandiseProduct essFemaleKhaki = seedProduct(
                "ESS Female Khaki Short",
                "[College] Official ESS uniform khaki shorts for female students. 1st to 4th year. Sizes XS to 6XL.",
                MerchandiseCategory.CLOTHING, MerchandiseGender.FEMALE);
        seedVariantSizes(essFemaleKhaki, fullSizes, "Khaki", "ESS-F-K", 3, new BigDecimal("600.00"));

        // ── Bulldog Exchange: Official Uniforms — PE ─────────────────────────
        MerchandiseProduct peShirt = seedProduct(
                "PE Shirt",
                "[College] Official PE uniform shirt. White, no-dim fabric. Sizes XS to 4XL.",
                MerchandiseCategory.CLOTHING, MerchandiseGender.UNISEX);
        seedVariantSizes(peShirt, allSizes, "White", "PE-T", 5, new BigDecimal("300.00"));

        MerchandiseProduct pePants = seedProduct(
                "PE Jogging Pants",
                "[College] Official PE uniform jogging pants. Navy blue, no-dim fabric. Sizes XS to 4XL.",
                MerchandiseCategory.CLOTHING, MerchandiseGender.UNISEX);
        seedVariantSizes(pePants, allSizes, "Navy Blue", "PE-B", 5, new BigDecimal("400.00"));

        // ── Bulldog Exchange: Official Uniforms — SHS Traditional ────────────
        // SHS products use MerchandiseCategory.SHS so they can be filtered by the SHS tab
        MerchandiseProduct tradShsMaleTop = seedProduct(
                "[SHS] Traditional Uniform Male Polo",
                "[SHS] Official SHS Traditional Uniform male polo shirt. For Senior High School students only.",
                MerchandiseCategory.SHS, MerchandiseGender.MALE);
        seedVariantSizes(tradShsMaleTop, stdSizes, null, "TRAD-SHS-M-T", 3, new BigDecimal("650.00"));
        seedVariantSizes(tradShsMaleTop, extSizes, null, "TRAD-SHS-M-T", 1, new BigDecimal("950.00"));

        MerchandiseProduct tradShsMaleBottom = seedProduct(
                "[SHS] Traditional Uniform Male Pants",
                "[SHS] Official SHS Traditional Uniform male pants. Color: Navy Blue. For Senior High School students only.",
                MerchandiseCategory.SHS, MerchandiseGender.MALE);
        seedVariantSizes(tradShsMaleBottom, stdSizes, "Navy Blue", "TRAD-SHS-M-B", 3, new BigDecimal("550.00"));
        seedVariantSizes(tradShsMaleBottom, extSizes, "Navy Blue", "TRAD-SHS-M-B", 1, new BigDecimal("800.00"));

        MerchandiseProduct tradShsFemaleTop = seedProduct(
                "[SHS] Traditional Uniform Female Blouse",
                "[SHS] Official SHS Traditional Uniform female blouse. For Senior High School students only.",
                MerchandiseCategory.SHS, MerchandiseGender.FEMALE);
        seedVariantSizes(tradShsFemaleTop, stdSizes, null, "TRAD-SHS-F-T", 3, new BigDecimal("650.00"));
        seedVariantSizes(tradShsFemaleTop, extSizes, null, "TRAD-SHS-F-T", 1, new BigDecimal("950.00"));

        MerchandiseProduct tradShsFemaleBottom = seedProduct(
                "[SHS] Traditional Uniform Female Skirt",
                "[SHS] Official SHS Traditional Uniform female navy blue skirt. For Senior High School students only.",
                MerchandiseCategory.SHS, MerchandiseGender.FEMALE);
        seedVariantSizes(tradShsFemaleBottom, stdSizes, "Navy Blue", "TRAD-SHS-F-B", 3, new BigDecimal("400.00"));

        // ── Bulldog Exchange: Official Uniforms — College Traditional ────────
        MerchandiseProduct tradColMaleTop = seedProduct(
                "[College] Traditional Uniform Male Polo",
                "[College] Official NU Laguna College Traditional Uniform male polo shirt.",
                MerchandiseCategory.CLOTHING, MerchandiseGender.MALE);
        seedVariantSizes(tradColMaleTop, stdSizes, null, "TRAD-COL-M-T", 3, new BigDecimal("650.00"));
        seedVariantSizes(tradColMaleTop, extSizes, null, "TRAD-COL-M-T", 1, new BigDecimal("950.00"));

        MerchandiseProduct tradColMaleBottom = seedProduct(
                "[College] Traditional Uniform Male Pants",
                "[College] Official NU Laguna College Traditional Uniform male pants. Color: Navy Blue.",
                MerchandiseCategory.CLOTHING, MerchandiseGender.MALE);
        seedVariantSizes(tradColMaleBottom, stdSizes, "Navy Blue", "TRAD-COL-M-B", 3, new BigDecimal("550.00"));
        seedVariantSizes(tradColMaleBottom, extSizes, "Navy Blue", "TRAD-COL-M-B", 1, new BigDecimal("800.00"));

        MerchandiseProduct tradColFemaleTop = seedProduct(
                "[College] Traditional Uniform Female Blouse",
                "[College] Official NU Laguna College Traditional Uniform female blouse.",
                MerchandiseCategory.CLOTHING, MerchandiseGender.FEMALE);
        seedVariantSizes(tradColFemaleTop, stdSizes, null, "TRAD-COL-F-T", 3, new BigDecimal("650.00"));
        seedVariantSizes(tradColFemaleTop, extSizes, null, "TRAD-COL-F-T", 1, new BigDecimal("950.00"));

        MerchandiseProduct tradColFemaleBottom = seedProduct(
                "[College] Traditional Uniform Female Skirt",
                "[College] Official NU Laguna College Traditional Uniform female navy blue skirt.",
                MerchandiseCategory.CLOTHING, MerchandiseGender.FEMALE);
        seedVariantSizes(tradColFemaleBottom, stdSizes, "Navy Blue", "TRAD-COL-F-B", 3, new BigDecimal("400.00"));

        // ── Bulldog Exchange: Official Uniforms — Tourism (College) ──────────
        MerchandiseProduct tourMaleCoat = seedProduct(
                "Tourism Uniform Male Coat",
                "[College] Official NU Laguna Tourism Uniform male coat. 1st to 4th year.",
                MerchandiseCategory.CLOTHING, MerchandiseGender.MALE);
        seedVariantSizes(tourMaleCoat, stdSizes, null, "TOUR-M-C", 2, new BigDecimal("1400.00"));
        seedVariantSizes(tourMaleCoat, extSizes, null, "TOUR-M-C", 1, new BigDecimal("1600.00"));

        MerchandiseProduct tourMaleVest = seedProduct(
                "Tourism Uniform Male Vest",
                "[College] Official NU Laguna Tourism Uniform male vest. 1st to 4th year.",
                MerchandiseCategory.CLOTHING, MerchandiseGender.MALE);
        seedVariantSizes(tourMaleVest, stdSizes, null, "TOUR-M-V", 2, new BigDecimal("650.00"));
        seedVariantSizes(tourMaleVest, extSizes, null, "TOUR-M-V", 1, new BigDecimal("800.00"));

        MerchandiseProduct tourMalePants = seedProduct(
                "Tourism Uniform Male Pants",
                "[College] Official NU Laguna Tourism Uniform male pants. 1st to 4th year.",
                MerchandiseCategory.CLOTHING, MerchandiseGender.MALE);
        seedVariantSizes(tourMalePants, stdSizes, null, "TOUR-M-P", 2, new BigDecimal("800.00"));
        seedVariantSizes(tourMalePants, extSizes, null, "TOUR-M-P", 1, new BigDecimal("1000.00"));

        MerchandiseProduct tourScarf = seedProduct(
                "Tourism Uniform Female Scarf",
                "[College] Official NU Laguna Tourism Uniform female scarf. One size.",
                MerchandiseCategory.CLOTHING, MerchandiseGender.FEMALE);
        seedVariant(tourScarf, "One Size", null, "TOUR-F-SCF", 20, new BigDecimal("350.00"));

        MerchandiseProduct tourFemaleBlazer = seedProduct(
                "Tourism Uniform Female Blazer",
                "[College] Official NU Laguna Tourism Uniform female blazer. 1st to 4th year.",
                MerchandiseCategory.CLOTHING, MerchandiseGender.FEMALE);
        seedVariantSizes(tourFemaleBlazer, stdSizes, null, "TOUR-F-BL", 2, new BigDecimal("1400.00"));
        seedVariantSizes(tourFemaleBlazer, extSizes, null, "TOUR-F-BL", 1, new BigDecimal("1600.00"));

        MerchandiseProduct tourFemaleVest = seedProduct(
                "Tourism Uniform Female Vest",
                "[College] Official NU Laguna Tourism Uniform female vest. 1st to 4th year.",
                MerchandiseCategory.CLOTHING, MerchandiseGender.FEMALE);
        seedVariantSizes(tourFemaleVest, stdSizes, null, "TOUR-F-V", 2, new BigDecimal("650.00"));
        seedVariantSizes(tourFemaleVest, extSizes, null, "TOUR-F-V", 1, new BigDecimal("800.00"));

        MerchandiseProduct tourFemaleSkirt = seedProduct(
                "Tourism Uniform Female Skirt",
                "[College] Official NU Laguna Tourism Uniform female skirt. 1st to 4th year.",
                MerchandiseCategory.CLOTHING, MerchandiseGender.FEMALE);
        seedVariantSizes(tourFemaleSkirt, stdSizes, null, "TOUR-F-SK", 2, new BigDecimal("650.00"));
        seedVariantSizes(tourFemaleSkirt, extSizes, null, "TOUR-F-SK", 1, new BigDecimal("750.00"));

        // ── Bulldog Exchange: Accessories & Collectibles ──────────────────────
        MerchandiseProduct bbCap = seedProduct(
                "NU Bulldog Basketball Cap",
                "Official NU Laguna Bulldog basketball cap. One size fits all.",
                MerchandiseCategory.ACCESSORIES);
        seedVariant(bbCap, "One Size", null, "CAP-BBALL", 30, new BigDecimal("249.00"));

        MerchandiseProduct plushieToy = seedProduct(
                "NU Bulldog Plushie Toy",
                "Adorable NU Laguna Bulldog plushie toy. The perfect souvenir and gift for Bulldog fans.",
                MerchandiseCategory.OTHER);
        seedVariant(plushieToy, null, null, "PLUSH-TOY", 25, new BigDecimal("399.00"));

        MerchandiseProduct plushKeychain = seedProduct(
                "NU Bulldog Plush Key Chain",
                "Cute NU Laguna Bulldog plush key chain. Keep your Bulldog spirit with you everywhere.",
                MerchandiseCategory.ACCESSORIES);
        seedVariant(plushKeychain, null, null, "PLUSH-KC", 50, new BigDecimal("249.00"));

        // ── Bulldog Exchange: Drinkware ───────────────────────────────────────
        MerchandiseProduct tumbler = seedProduct(
                "NU HydroFresh FlipStraw Kids Tumbler Leakproof",
                "NU Laguna HydroFresh FlipStraw kids tumbler. Leakproof design, perfect for campus use.",
                MerchandiseCategory.EQUIPMENT);
        seedVariant(tumbler, null, null, "TUMBLER-FLIPSTRAW", 20, new BigDecimal("399.00"));

        MerchandiseProduct foodJar = seedProduct(
                "HydroFresh Insulated Food Jar with Spoon",
                "NU Laguna HydroFresh insulated food jar with spoon. Keeps meals hot or cold on campus.",
                MerchandiseCategory.EQUIPMENT);
        seedVariant(foodJar, null, null, "FOOD-JAR-SPOON", 20, new BigDecimal("499.00"));

        // ── Announcements ─────────────────────────────────────────────────────
        seedAnnouncement(admin.getId(),
                "Enrollment Period Now Open — AY 2026–2027",
                "Online enrollment for Academic Year 2026–2027 is now open. " +
                "Log in to the student portal to select your subjects. Enrollment closes on June 15. " +
                "Coordinate with your academic adviser for any concerns.",
                AnnouncementPriority.IMPORTANT, LocalDateTime.now().plusDays(14));

        seedAnnouncement(admin.getId(),
                "Scheduled System Maintenance — June 5, 2:00 AM–5:00 AM",
                "NUverse Laguna will be undergoing scheduled maintenance on June 5, 2026 from 2:00 AM to 5:00 AM. " +
                "All services including the marketplace and exchange will be temporarily unavailable. " +
                "We apologize for the inconvenience.",
                AnnouncementPriority.GENERAL, LocalDateTime.now().plusDays(4));

        // ── Lost & Found Items ────────────────────────────────────────────────
        seedLostFound(s1.getId(), ItemType.LOST,
                "Lost: Navy Blue Umbrella",
                "Lost my navy blue foldable umbrella near the library on the 3rd floor. " +
                "Has a small NU keychain attached to the handle. Please contact me if found.",
                "3rd Floor Library Area",
                LocalDate.now().minusDays(2),
                "alex.delacruz@students.nu-laguna.edu.ph");

        seedLostFound(s2.getId(), ItemType.FOUND,
                "Found: Student ID (Reyes, Maria)",
                "Found a student ID near the cafeteria entrance. Name on card is Maria Reyes, " +
                "BSIT 2nd year. Please contact me to claim.",
                "Near Main Cafeteria Entrance",
                LocalDate.now().minusDays(1),
                "jamie.reyes@students.nu-laguna.edu.ph");

        seedLostFound(s3.getId(), ItemType.LOST,
                "Lost: Scientific Calculator (Casio fx-991ES)",
                "Lost my Casio fx-991ES calculator after the Math class in Room 204. " +
                "Has my name 'Sam V' written in marker on the back cover.",
                "Room 204, 2nd Floor Academic Building",
                LocalDate.now().minusDays(3),
                "sam.villanueva@students.nu-laguna.edu.ph");

        seedLostFound(s1.getId(), ItemType.FOUND,
                "Found: White Apple EarPods (Wired)",
                "Found a pair of Apple EarPods (wired, lightning connector) in the computer lab. " +
                "They are in good condition. Contact me to identify and claim.",
                "Computer Laboratory, 2nd Floor",
                LocalDate.now().minusDays(1),
                "alex.delacruz@students.nu-laguna.edu.ph");

        seedLostFound(s2.getId(), ItemType.LOST,
                "Lost: Blue Zippered Pencil Case",
                "Lost my blue zippered pencil case with various pens, highlighters, and a USB drive inside. " +
                "Somewhere between the canteen and the covered walk. Very important — please help!",
                "Covered Walk / Canteen Area",
                LocalDate.now().minusDays(4),
                "jamie.reyes@students.nu-laguna.edu.ph");

        seedLostFound(s3.getId(), ItemType.FOUND,
                "Found: NU Laguna Lanyard with Keys",
                "Found an NU Laguna lanyard with two keys attached near the gym entrance. " +
                "One key appears to be a padlock key. Contact me to claim.",
                "Near Gymnasium Entrance",
                LocalDate.now(),
                "sam.villanueva@students.nu-laguna.edu.ph");

        log.info("[DevDataSeeder] Seed complete — {} users, 5 events, 7 listings, exchange products with individual size variants, " +
                 "2 announcements, 6 lost & found items.", 5);
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
        return seedProduct(name, description, category, MerchandiseGender.UNISEX);
    }

    private MerchandiseProduct seedProduct(String name, String description,
                                            MerchandiseCategory category, MerchandiseGender gender) {
        MerchandiseProduct product = MerchandiseProduct.create(name, description, null,
                category, gender);
        return productRepository.save(product);
    }

    private void seedVariant(MerchandiseProduct product, String size, String color,
                              String sku, int stock, BigDecimal price) {
        ProductVariant variant = ProductVariant.create(product, size, color, sku, stock, price);
        variantRepository.save(variant);
    }

    private void seedVariantSizes(MerchandiseProduct product, String[] sizes, String color,
                                   String skuBase, int stockPerSize, BigDecimal price) {
        for (String size : sizes) {
            String sku = skuBase + "-" + size;
            seedVariant(product, size, color, sku, stockPerSize, price);
        }
    }

    private void seedAnnouncement(UUID adminId, String title, String body,
                                   AnnouncementPriority priority, LocalDateTime expiresAt) {
        EmergencyAnnouncement a = EmergencyAnnouncement.create(title, body, priority, adminId, expiresAt);
        announcementRepository.save(a);
    }

    private void seedLostFound(UUID reporterId, ItemType type, String title, String description,
                                String location, LocalDate itemDate, String contact) {
        LostFoundItem item = LostFoundItem.create(reporterId, type, title, description,
                location, itemDate, null, contact);
        lostFoundRepository.save(item);
    }
}
