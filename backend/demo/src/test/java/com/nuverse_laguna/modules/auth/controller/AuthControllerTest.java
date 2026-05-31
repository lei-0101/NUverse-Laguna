package com.nuverse_laguna.modules.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nuverse_laguna.modules.auth.application.AuthService;
import com.nuverse_laguna.modules.auth.dto.LoginRequest;
import com.nuverse_laguna.modules.auth.dto.LoginResult;
import com.nuverse_laguna.modules.auth.dto.RegisterRequest;
import com.nuverse_laguna.modules.auth.dto.UserResponse;
import com.nuverse_laguna.shared.exception.AppException;
import com.nuverse_laguna.shared.handler.GlobalExceptionHandler;
import com.nuverse_laguna.shared.security.CookieHelper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseCookie;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthController")
class AuthControllerTest {

    @Mock AuthService authService;
    @Mock CookieHelper cookieHelper;

    MockMvc mockMvc;
    ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        AuthController controller = new AuthController(authService, cookieHelper);
        mockMvc = MockMvcBuilders
                .standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .setMessageConverters(new MappingJackson2HttpMessageConverter(objectMapper))
                .build();
    }

    // ─── POST /api/auth/register ──────────────────────────────────────────────

    @Test
    @DisplayName("register: valid request returns 201")
    void register_validRequest_returns201() throws Exception {
        RegisterRequest request = new RegisterRequest(
                "juan@students.nu-laguna.edu.ph", "Password1", "Juan Dela Cruz"
        );
        doNothing().when(authService).register(any());

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("register: invalid email format returns 400 — validation enforced before service")
    void register_invalidEmail_returns400() throws Exception {
        RegisterRequest request = new RegisterRequest("notanemail", "Password1", "Juan");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));

        verifyNoInteractions(authService);
    }

    @Test
    @DisplayName("register: weak password returns 400")
    void register_weakPassword_returns400() throws Exception {
        RegisterRequest request = new RegisterRequest("juan@students.nu-laguna.edu.ph", "weak", "Juan");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));

        verifyNoInteractions(authService);
    }

    @Test
    @DisplayName("register: blank full name returns 400")
    void register_blankName_returns400() throws Exception {
        RegisterRequest request = new RegisterRequest("juan@students.nu-laguna.edu.ph", "Password1", "");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    // ─── POST /api/auth/login ─────────────────────────────────────────────────

    @Test
    @DisplayName("login: valid credentials returns 200 with Set-Cookie header")
    void login_validCredentials_returns200WithCookie() throws Exception {
        UUID userId = UUID.randomUUID();
        UserResponse userResponse = new UserResponse(
                userId, "juan@students.nu-laguna.edu.ph", "Juan Dela Cruz", "ROLE_STUDENT", "ACTIVE", null, 0, null
        );
        LoginResult loginResult = new LoginResult("jwt-token", userResponse);
        ResponseCookie cookie = ResponseCookie.from("access_token", "jwt-token")
                .httpOnly(true).path("/").build();

        when(authService.login(any(LoginRequest.class))).thenReturn(loginResult);
        when(cookieHelper.createJwtCookie("jwt-token")).thenReturn(cookie);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new LoginRequest("juan@students.nu-laguna.edu.ph", "Password1"))))
                .andExpect(status().isOk())
                .andExpect(header().exists(HttpHeaders.SET_COOKIE))
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.email").value("juan@students.nu-laguna.edu.ph"));
    }

    @Test
    @DisplayName("login: service throws 401 → controller returns 401")
    void login_invalidCredentials_returns401() throws Exception {
        when(authService.login(any())).thenThrow(new AppException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new LoginRequest("juan@students.nu-laguna.edu.ph", "WrongPass1"))))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));
    }

    // ─── POST /api/auth/logout ────────────────────────────────────────────────

    @Test
    @DisplayName("logout: returns 200 with cleared Set-Cookie header")
    void logout_returns200WithClearedCookie() throws Exception {
        ResponseCookie clearedCookie = ResponseCookie.from("access_token", "")
                .httpOnly(true).path("/").maxAge(0).build();

        when(cookieHelper.clearJwtCookie()).thenReturn(clearedCookie);

        mockMvc.perform(post("/api/auth/logout"))
                .andExpect(status().isOk())
                .andExpect(header().exists(HttpHeaders.SET_COOKIE))
                .andExpect(jsonPath("$.success").value(true));
    }

    // ─── GET /api/auth/me ─────────────────────────────────────────────────────

    @Test
    @DisplayName("me: authenticated request returns 200 with user data")
    void me_authenticated_returns200() throws Exception {
        UUID userId = UUID.randomUUID();
        UserResponse userResponse = new UserResponse(
                userId, "juan@students.nu-laguna.edu.ph", "Juan Dela Cruz", "ROLE_STUDENT", "ACTIVE", null, 0, null
        );
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                userId.toString(), null,
                List.of(new SimpleGrantedAuthority("ROLE_STUDENT"))
        );

        when(authService.getCurrentUser(userId)).thenReturn(userResponse);

        mockMvc.perform(get("/api/auth/me").with(asUser(auth)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.email").value("juan@students.nu-laguna.edu.ph"));
    }

    // Sets both SecurityContextHolder and request.userPrincipal so standalone MockMvc
    // resolves Authentication auth controller parameters correctly.
    private RequestPostProcessor asUser(Authentication auth) {
        return request -> {
            var ctx = SecurityContextHolder.createEmptyContext();
            ctx.setAuthentication(auth);
            SecurityContextHolder.setContext(ctx);
            request.setUserPrincipal(auth);
            return request;
        };
    }
}
