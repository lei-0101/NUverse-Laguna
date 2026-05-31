package com.nuverse_laguna.modules.auth.application;

import com.nuverse_laguna.modules.auth.domain.User;
import com.nuverse_laguna.modules.auth.domain.UserStatus;
import com.nuverse_laguna.modules.auth.dto.LoginRequest;
import com.nuverse_laguna.modules.auth.dto.LoginResult;
import com.nuverse_laguna.modules.auth.dto.RegisterRequest;
import com.nuverse_laguna.modules.auth.dto.UserResponse;
import com.nuverse_laguna.modules.auth.infrastructure.EmailService;
import com.nuverse_laguna.modules.auth.mapper.UserMapper;
import com.nuverse_laguna.modules.auth.repository.UserRepository;
import com.nuverse_laguna.shared.exception.AppException;
import com.nuverse_laguna.shared.exception.ResourceNotFoundException;
import com.nuverse_laguna.shared.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.context.ApplicationEventPublisher;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@DisplayName("AuthServiceImpl")
class AuthServiceImplTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtService jwtService;
    @Mock private EmailService emailService;
    @Mock private UserMapper userMapper;
    @Mock private AuthConfig authConfig;
    @Mock private ApplicationEventPublisher eventPublisher;

    private AuthServiceImpl authService;

    private static final String NU_EMAIL = "juan.delacruz@students.nu-laguna.edu.ph";
    private static final String HASHED_PASSWORD = "$2a$10$hashedpasswordvalue";

    @BeforeEach
    void setUp() {
        authService = new AuthServiceImpl(
                userRepository, passwordEncoder, jwtService,
                emailService, userMapper, authConfig, eventPublisher, "http://localhost:8080"
        );
        when(authConfig.getAllowedEmailDomains()).thenReturn(List.of("students.nu-laguna.edu.ph"));
    }

    // ───────────────────── register ─────────────────────

    @Test
    @DisplayName("register: valid NU email saves user and sends verification email")
    void register_validRequest_savesUserAndSendsEmail() {
        RegisterRequest request = new RegisterRequest(NU_EMAIL, "Password1", "Juan Dela Cruz");
        when(userRepository.existsByEmail(NU_EMAIL)).thenReturn(false);
        when(passwordEncoder.encode("Password1")).thenReturn(HASHED_PASSWORD);
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        authService.register(request);

        verify(userRepository).save(any(User.class));
        verify(emailService).sendVerificationEmail(eq(NU_EMAIL), contains("/api/auth/verify-email?token="));
    }

    @Test
    @DisplayName("register: non-NU email throws 400")
    void register_nonNuEmail_throwsBadRequest() {
        RegisterRequest request = new RegisterRequest("juan@gmail.com", "Password1", "Juan");

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(AppException.class)
                .satisfies(ex -> assertThat(((AppException) ex).getStatus()).isEqualTo(HttpStatus.BAD_REQUEST));

        verifyNoInteractions(userRepository, emailService);
    }

    @Test
    @DisplayName("register: duplicate email throws 409")
    void register_duplicateEmail_throwsConflict() {
        RegisterRequest request = new RegisterRequest(NU_EMAIL, "Password1", "Juan");
        when(userRepository.existsByEmail(NU_EMAIL)).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(AppException.class)
                .satisfies(ex -> assertThat(((AppException) ex).getStatus()).isEqualTo(HttpStatus.CONFLICT));

        verify(userRepository, never()).save(any());
        verifyNoInteractions(emailService);
    }

    // ───────────────────── login ─────────────────────

    @Test
    @DisplayName("login: valid credentials with ACTIVE account returns LoginResult")
    void login_validCredentials_returnsLoginResult() {
        User activeUser = createActiveUser();
        UserResponse userResponse = new UserResponse(
                activeUser.getId(), NU_EMAIL, "Juan Dela Cruz", "ROLE_STUDENT", "ACTIVE", null, 0, null
        );
        LoginRequest request = new LoginRequest(NU_EMAIL, "Password1");

        when(userRepository.findByEmail(NU_EMAIL)).thenReturn(Optional.of(activeUser));
        when(passwordEncoder.matches("Password1", HASHED_PASSWORD)).thenReturn(true);
        when(jwtService.generateToken(anyString(), eq("ROLE_STUDENT"))).thenReturn("jwt-token");
        when(userMapper.toResponse(activeUser)).thenReturn(userResponse);

        LoginResult result = authService.login(request);

        assertThat(result).isNotNull();
        assertThat(result.token()).isEqualTo("jwt-token");
        assertThat(result.user().email()).isEqualTo(NU_EMAIL);
    }

    @Test
    @DisplayName("login: wrong password throws 401")
    void login_wrongPassword_throwsUnauthorized() {
        User activeUser = createActiveUser();
        LoginRequest request = new LoginRequest(NU_EMAIL, "WrongPass1");

        when(userRepository.findByEmail(NU_EMAIL)).thenReturn(Optional.of(activeUser));
        when(passwordEncoder.matches("WrongPass1", HASHED_PASSWORD)).thenReturn(false);

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(AppException.class)
                .satisfies(ex -> assertThat(((AppException) ex).getStatus()).isEqualTo(HttpStatus.UNAUTHORIZED));
    }

    @Test
    @DisplayName("login: email not found throws 401 (same message — prevents user enumeration)")
    void login_emailNotFound_throwsUnauthorized() {
        when(userRepository.findByEmail(NU_EMAIL)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(new LoginRequest(NU_EMAIL, "Password1")))
                .isInstanceOf(AppException.class)
                .satisfies(ex -> assertThat(((AppException) ex).getStatus()).isEqualTo(HttpStatus.UNAUTHORIZED));
    }

    @Test
    @DisplayName("login: PENDING_VERIFICATION account throws 403")
    void login_pendingVerification_throwsForbidden() {
        User pendingUser = createPendingUser();
        LoginRequest request = new LoginRequest(NU_EMAIL, "Password1");

        when(userRepository.findByEmail(NU_EMAIL)).thenReturn(Optional.of(pendingUser));
        when(passwordEncoder.matches("Password1", HASHED_PASSWORD)).thenReturn(true);

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(AppException.class)
                .satisfies(ex -> assertThat(((AppException) ex).getStatus()).isEqualTo(HttpStatus.FORBIDDEN));
    }

    // ───────────────────── verifyEmail ─────────────────────

    @Test
    @DisplayName("verifyEmail: valid token activates account")
    void verifyEmail_validToken_activatesUser() {
        User pendingUser = createPendingUser();
        String token = pendingUser.getVerificationToken();

        when(userRepository.findByVerificationToken(token)).thenReturn(Optional.of(pendingUser));
        when(userRepository.save(pendingUser)).thenReturn(pendingUser);

        authService.verifyEmail(token);

        assertThat(pendingUser.getStatus()).isEqualTo(UserStatus.ACTIVE);
        assertThat(pendingUser.getVerificationToken()).isNull();
        verify(userRepository).save(pendingUser);
    }

    @Test
    @DisplayName("verifyEmail: invalid token throws 400")
    void verifyEmail_invalidToken_throwsBadRequest() {
        when(userRepository.findByVerificationToken("invalid-token")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.verifyEmail("invalid-token"))
                .isInstanceOf(AppException.class)
                .satisfies(ex -> assertThat(((AppException) ex).getStatus()).isEqualTo(HttpStatus.BAD_REQUEST));
    }

    @Test
    @DisplayName("verifyEmail: already active account throws 400 (domain invariant)")
    void verifyEmail_alreadyActive_throwsBadRequest() {
        User activeUser = createActiveUser();
        // Simulate finding an active user by token (edge case: token reuse attempt)
        when(userRepository.findByVerificationToken("some-token")).thenReturn(Optional.of(activeUser));

        // User.activate() enforces the invariant and throws AppException
        assertThatThrownBy(() -> authService.verifyEmail("some-token"))
                .isInstanceOf(AppException.class)
                .satisfies(ex -> assertThat(((AppException) ex).getStatus()).isEqualTo(HttpStatus.BAD_REQUEST));
    }

    // ───────────────────── getCurrentUser ─────────────────────

    @Test
    @DisplayName("getCurrentUser: found user returns UserResponse")
    void getCurrentUser_found_returnsUserResponse() {
        User activeUser = createActiveUser();
        UUID userId = UUID.randomUUID();
        UserResponse userResponse = new UserResponse(userId, NU_EMAIL, "Juan", "ROLE_STUDENT", "ACTIVE", null, 0, null);

        when(userRepository.findById(userId)).thenReturn(Optional.of(activeUser));
        when(userMapper.toResponse(activeUser)).thenReturn(userResponse);

        UserResponse result = authService.getCurrentUser(userId);

        assertThat(result).isNotNull();
        assertThat(result.email()).isEqualTo(NU_EMAIL);
    }

    @Test
    @DisplayName("getCurrentUser: user not found throws ResourceNotFoundException")
    void getCurrentUser_notFound_throwsNotFoundException() {
        UUID userId = UUID.randomUUID();
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.getCurrentUser(userId))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ───────────────────── helpers ─────────────────────

    private User createPendingUser() {
        return User.create(NU_EMAIL, HASHED_PASSWORD, "Juan Dela Cruz");
    }

    private User createActiveUser() {
        User user = createPendingUser();
        user.activate();
        return user;
    }
}
