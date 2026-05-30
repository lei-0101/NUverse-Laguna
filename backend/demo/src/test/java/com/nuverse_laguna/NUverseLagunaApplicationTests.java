package com.nuverse_laguna;

import com.nuverse_laguna.modules.auth.application.AuthService;
import com.nuverse_laguna.modules.auth.dto.RegisterRequest;
import com.nuverse_laguna.modules.profile.repository.UserProfileRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.test.context.ActiveProfiles;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.assertj.core.api.Assertions.assertThat;
import static org.awaitility.Awaitility.await;

import java.time.Duration;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
@ActiveProfiles("test")
@DisplayName("Application Integration")
class NUverseLagunaApplicationTests {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @Autowired
    private AuthService authService;

    @Autowired
    private UserProfileRepository userProfileRepository;

    @Test
    @DisplayName("application context loads with real PostgreSQL container")
    void contextLoads() {
        // Verifies full context startup: Flyway migrations run, JPA validates schema,
        // all Spring beans wire correctly against a real PostgreSQL instance.
    }

    @Test
    @DisplayName("registration commits a user profile via the AFTER_COMMIT event listener")
    void registration_createsProfile() {
        // Regression guard: the profile is created in an AFTER_COMMIT listener and only
        // persists because that listener runs in a REQUIRES_NEW transaction. Without it,
        // the INSERT joins the already-committed registration transaction and is lost.
        String email = "profile.regression@national-u.edu.ph";
        authService.register(new RegisterRequest(email, "Password1", "Profile Regression"));

        await().atMost(Duration.ofSeconds(5)).untilAsserted(() ->
                assertThat(userProfileRepository.findAll())
                        .anyMatch(p -> "Profile Regression".equals(p.getFullName())));
    }
}
