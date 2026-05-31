package com.nuverse_laguna.modules.chibi.controller;

import com.fasterxml.jackson.databind.MapperFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.nuverse_laguna.modules.chibi.application.ChibiService;
import com.nuverse_laguna.modules.chibi.dto.ChibiProfileResponse;
import com.nuverse_laguna.shared.exception.AppException;
import com.nuverse_laguna.shared.handler.GlobalExceptionHandler;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ChibiController")
class ChibiControllerTest {

    @Mock ChibiService chibiService;

    MockMvc mockMvc;

    static final UUID USER_ID   = UUID.randomUUID();
    static final UUID TARGET_ID = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        ObjectMapper objectMapper = new ObjectMapper()
                .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
                .disable(MapperFeature.REQUIRE_HANDLERS_FOR_JAVA8_TIMES);
        ChibiController controller = new ChibiController(chibiService);
        mockMvc = MockMvcBuilders
                .standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .setMessageConverters(new MappingJackson2HttpMessageConverter(objectMapper))
                .build();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    // ── GET /api/chibi/me ─────────────────────────────────────────────────────

    @Test
    @DisplayName("GET /api/chibi/me: returns 200 with authenticated user's chibi profile")
    void getMyProfile_returnsOk() throws Exception {
        when(chibiService.getOrCreate(USER_ID)).thenReturn(sampleProfile(USER_ID));

        mockMvc.perform(get("/api/chibi/me")
                        .with(asUser(studentAuth(USER_ID))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.userId").value(USER_ID.toString()))
                .andExpect(jsonPath("$.data.level").value(3))
                .andExpect(jsonPath("$.data.title").value("Campus Explorer"));
    }

    @Test
    @DisplayName("GET /api/chibi/me: XP fields are present in response")
    void getMyProfile_xpFieldsPresent() throws Exception {
        when(chibiService.getOrCreate(USER_ID)).thenReturn(sampleProfile(USER_ID));

        mockMvc.perform(get("/api/chibi/me")
                        .with(asUser(studentAuth(USER_ID))))
                .andExpect(jsonPath("$.data.xp").value(350))
                .andExpect(jsonPath("$.data.xpToNextLevel").exists())
                .andExpect(jsonPath("$.data.achievements").isArray());
    }

    // ── GET /api/chibi/users/{userId} ─────────────────────────────────────────

    @Test
    @DisplayName("GET /api/chibi/users/{userId}: returns 200 with target user's profile")
    void getUserProfile_returnsOk() throws Exception {
        when(chibiService.getForUser(TARGET_ID)).thenReturn(sampleProfile(TARGET_ID));

        mockMvc.perform(get("/api/chibi/users/" + TARGET_ID)
                        .with(asUser(studentAuth(USER_ID))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.userId").value(TARGET_ID.toString()))
                .andExpect(jsonPath("$.data.level").value(3));
    }

    @Test
    @DisplayName("GET /api/chibi/users/{userId}: service error propagates as 404")
    void getUserProfile_notFound_returns404() throws Exception {
        when(chibiService.getForUser(any()))
                .thenThrow(new AppException(HttpStatus.NOT_FOUND, "Profile not found"));

        mockMvc.perform(get("/api/chibi/users/" + TARGET_ID)
                        .with(asUser(studentAuth(USER_ID))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private ChibiProfileResponse sampleProfile(UUID userId) {
        return new ChibiProfileResponse(
                userId, 350, 3, "Campus Explorer",
                250, 300, 600, List.of(), LocalDateTime.now());
    }

    private UsernamePasswordAuthenticationToken studentAuth(UUID userId) {
        return new UsernamePasswordAuthenticationToken(
                userId.toString(), null,
                List.of(new SimpleGrantedAuthority("ROLE_STUDENT")));
    }

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
