package com.nuverse_laguna.modules.notifications.controller;

import com.fasterxml.jackson.databind.MapperFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.nuverse_laguna.modules.notifications.application.NotificationService;
import com.nuverse_laguna.modules.notifications.dto.NotificationResponse;
import com.nuverse_laguna.modules.notifications.dto.UnreadCountResponse;
import com.nuverse_laguna.shared.exception.AppException;
import com.nuverse_laguna.shared.exception.ResourceNotFoundException;
import com.nuverse_laguna.shared.handler.GlobalExceptionHandler;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
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
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("NotificationController")
class NotificationControllerTest {

    @Mock NotificationService notificationService;

    MockMvc mockMvc;
    ObjectMapper objectMapper;

    static final UUID USER_ID = UUID.randomUUID();
    static final UUID NOTIFICATION_ID = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper()
                .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
                .disable(MapperFeature.REQUIRE_HANDLERS_FOR_JAVA8_TIMES);

        NotificationController controller = new NotificationController(notificationService);
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

    // ─── GET /api/notifications ───────────────────────────────────────────────

    @Test
    @DisplayName("GET /api/notifications: returns 200 with paginated notifications")
    void getMyNotifications_returnsOk() throws Exception {
        Page<NotificationResponse> page = new PageImpl<>(
                List.of(sampleResponse(false)), PageRequest.of(0, 20), 1);
        when(notificationService.getMyNotifications(eq(USER_ID), any())).thenReturn(page);

        mockMvc.perform(get("/api/notifications")
                        .with(asUser()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].type").value("RESERVATION_CREATED"))
                .andExpect(jsonPath("$.data.content[0].read").value(false));
    }

    @Test
    @DisplayName("GET /api/notifications: empty list returns 200 with empty content")
    void getMyNotifications_emptyList_returnsOk() throws Exception {
        Page<NotificationResponse> empty = new PageImpl<>(List.of(), PageRequest.of(0, 20), 0);
        when(notificationService.getMyNotifications(eq(USER_ID), any())).thenReturn(empty);

        mockMvc.perform(get("/api/notifications").with(asUser()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalElements").value(0));
    }

    // ─── GET /api/notifications/unread-count ─────────────────────────────────

    @Test
    @DisplayName("GET /unread-count: returns correct badge count")
    void getUnreadCount_returnsCount() throws Exception {
        when(notificationService.getUnreadCount(USER_ID)).thenReturn(new UnreadCountResponse(7L));

        mockMvc.perform(get("/api/notifications/unread-count").with(asUser()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.count").value(7));
    }

    @Test
    @DisplayName("GET /unread-count: zero unread returns 0")
    void getUnreadCount_zeroUnread_returnsZero() throws Exception {
        when(notificationService.getUnreadCount(USER_ID)).thenReturn(new UnreadCountResponse(0L));

        mockMvc.perform(get("/api/notifications/unread-count").with(asUser()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.count").value(0));
    }

    // ─── PATCH /api/notifications/{id}/read ──────────────────────────────────

    @Test
    @DisplayName("PATCH /{id}/read: marks notification as read and returns 200")
    void markAsRead_returnsOk() throws Exception {
        doNothing().when(notificationService).markAsRead(USER_ID, NOTIFICATION_ID);

        mockMvc.perform(patch("/api/notifications/" + NOTIFICATION_ID + "/read")
                        .with(asUser()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("PATCH /{id}/read: not found returns 404")
    void markAsRead_notFound_returns404() throws Exception {
        doThrow(new ResourceNotFoundException("Notification", NOTIFICATION_ID))
                .when(notificationService).markAsRead(USER_ID, NOTIFICATION_ID);

        mockMvc.perform(patch("/api/notifications/" + NOTIFICATION_ID + "/read")
                        .with(asUser()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("PATCH /{id}/read: non-owner returns 403")
    void markAsRead_nonOwner_returns403() throws Exception {
        doThrow(new AppException(HttpStatus.FORBIDDEN, "You do not own this notification"))
                .when(notificationService).markAsRead(USER_ID, NOTIFICATION_ID);

        mockMvc.perform(patch("/api/notifications/" + NOTIFICATION_ID + "/read")
                        .with(asUser()))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false));
    }

    // ─── PATCH /api/notifications/read-all ───────────────────────────────────

    @Test
    @DisplayName("PATCH /read-all: marks all as read and returns 200")
    void markAllAsRead_returnsOk() throws Exception {
        doNothing().when(notificationService).markAllAsRead(USER_ID);

        mockMvc.perform(patch("/api/notifications/read-all").with(asUser()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    // ─── DELETE /api/notifications/{id} ──────────────────────────────────────

    @Test
    @DisplayName("DELETE /{id}: deletes notification and returns 200")
    void delete_returnsOk() throws Exception {
        doNothing().when(notificationService).delete(USER_ID, NOTIFICATION_ID);

        mockMvc.perform(delete("/api/notifications/" + NOTIFICATION_ID).with(asUser()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("DELETE /{id}: not found returns 404")
    void delete_notFound_returns404() throws Exception {
        doThrow(new ResourceNotFoundException("Notification", NOTIFICATION_ID))
                .when(notificationService).delete(USER_ID, NOTIFICATION_ID);

        mockMvc.perform(delete("/api/notifications/" + NOTIFICATION_ID).with(asUser()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("DELETE /{id}: non-owner returns 403")
    void delete_nonOwner_returns403() throws Exception {
        doThrow(new AppException(HttpStatus.FORBIDDEN, "You do not own this notification"))
                .when(notificationService).delete(USER_ID, NOTIFICATION_ID);

        mockMvc.perform(delete("/api/notifications/" + NOTIFICATION_ID).with(asUser()))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false));
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private NotificationResponse sampleResponse(boolean read) {
        return new NotificationResponse(
                NOTIFICATION_ID,
                "RESERVATION_CREATED",
                "Reservation Confirmed",
                "Pick up within 48 hours.",
                UUID.randomUUID(),
                "RESERVATION",
                read,
                LocalDateTime.now()
        );
    }

    private RequestPostProcessor asUser() {
        Authentication auth = new UsernamePasswordAuthenticationToken(
                USER_ID.toString(), null,
                List.of(new SimpleGrantedAuthority("ROLE_STUDENT"))
        );
        return request -> {
            var ctx = SecurityContextHolder.createEmptyContext();
            ctx.setAuthentication(auth);
            SecurityContextHolder.setContext(ctx);
            request.setUserPrincipal(auth);
            return request;
        };
    }
}
