package com.nuverse_laguna.modules.auth.application;

import com.nuverse_laguna.modules.auth.domain.User;
import com.nuverse_laguna.modules.auth.dto.LoginRequest;
import com.nuverse_laguna.modules.auth.dto.LoginResult;
import com.nuverse_laguna.modules.auth.dto.RegisterRequest;
import com.nuverse_laguna.modules.auth.dto.UserResponse;
import com.nuverse_laguna.modules.auth.infrastructure.EmailService;
import com.nuverse_laguna.modules.auth.mapper.UserMapper;
import com.nuverse_laguna.modules.auth.repository.UserRepository;
import com.nuverse_laguna.shared.event.UserRegisteredEvent;
import com.nuverse_laguna.shared.exception.AppException;
import com.nuverse_laguna.shared.exception.ResourceNotFoundException;
import com.nuverse_laguna.shared.security.JwtService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;
    private final UserMapper userMapper;
    private final AuthConfig authConfig;
    private final ApplicationEventPublisher eventPublisher;
    private final String baseUrl;

    public AuthServiceImpl(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            EmailService emailService,
            UserMapper userMapper,
            AuthConfig authConfig,
            ApplicationEventPublisher eventPublisher,
            @Value("${app.base-url}") String baseUrl
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.emailService = emailService;
        this.userMapper = userMapper;
        this.authConfig = authConfig;
        this.eventPublisher = eventPublisher;
        this.baseUrl = baseUrl;
    }

    @Override
    public void register(RegisterRequest request) {
        validateNuEmail(request.email());

        if (userRepository.existsByEmail(request.email().toLowerCase())) {
            throw new AppException(HttpStatus.CONFLICT, "An account with this email already exists");
        }

        String hashedPassword = passwordEncoder.encode(request.password());
        User user = User.create(request.email().toLowerCase(), hashedPassword, request.fullName());
        User savedUser = userRepository.save(user);

        String verificationLink = baseUrl + "/api/auth/verify-email?token=" + savedUser.getVerificationToken();
        emailService.sendVerificationEmail(savedUser.getEmail(), verificationLink);

        eventPublisher.publishEvent(
                new UserRegisteredEvent(savedUser.getId(), savedUser.getEmail(), savedUser.getFullName())
        );

        log.info("New user registered: {}", savedUser.getEmail());
    }

    @Override
    @Transactional(readOnly = true)
    public LoginResult login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email().toLowerCase())
                .orElseThrow(() -> new AppException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new AppException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        if (!user.canLogin()) {
            throw new AppException(HttpStatus.FORBIDDEN,
                    "Account is not active. Please verify your email before logging in.");
        }

        String token = jwtService.generateToken(user.getId().toString(), user.getRole().name());
        return new LoginResult(token, userMapper.toResponse(user));
    }

    @Override
    public void verifyEmail(String token) {
        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new AppException(HttpStatus.BAD_REQUEST,
                        "Invalid or expired verification token"));

        user.activate();
        userRepository.save(user);

        log.info("Email verified for user: {}", user.getEmail());
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        return userMapper.toResponse(user);
    }

    private void validateNuEmail(String email) {
        String normalized = email.toLowerCase();
        boolean isValid = authConfig.getAllowedEmailDomains().stream()
                .anyMatch(domain -> normalized.endsWith("@" + domain));
        if (!isValid) {
            throw new AppException(HttpStatus.BAD_REQUEST,
                    "Registration is restricted to NU Laguna email accounts");
        }
    }
}
