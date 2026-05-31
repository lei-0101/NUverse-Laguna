package com.nuverse_laguna.modules.events.controller;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.*;
import com.fasterxml.jackson.databind.deser.std.StdDeserializer;
import com.fasterxml.jackson.databind.module.SimpleModule;
import com.fasterxml.jackson.databind.ser.std.StdSerializer;
import com.nuverse_laguna.modules.events.application.EventService;
import com.nuverse_laguna.modules.events.domain.DuplicateRsvpException;
import com.nuverse_laguna.modules.events.domain.EventCapacityExceededException;
import com.nuverse_laguna.modules.events.dto.*;
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
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("EventController")
class EventControllerTest {

    @Mock EventService eventService;
    @Mock com.nuverse_laguna.modules.profile.repository.UserProfileRepository profileRepository;

    MockMvc mockMvc;
    ObjectMapper objectMapper;

    static final UUID USER_ID  = UUID.randomUUID();
    static final UUID EVENT_ID = UUID.randomUUID();
    static final LocalDateTime FUTURE = LocalDateTime.now().plusDays(7);

    @BeforeEach
    void setUp() {
        // jackson-datatype-jsr310 is not on the test classpath (Spring Boot 4/Jackson 2
        // regression). Register a lightweight LocalDateTime module so request/response
        // bodies containing datetime fields survive the Jackson 2 round-trip.
        SimpleModule dateModule = new SimpleModule();
        dateModule.addSerializer(LocalDateTime.class, new StdSerializer<>(LocalDateTime.class) {
            @Override public void serialize(LocalDateTime v, JsonGenerator g, SerializerProvider p) throws IOException {
                g.writeString(v.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            }
        });
        dateModule.addDeserializer(LocalDateTime.class, new StdDeserializer<>(LocalDateTime.class) {
            @Override public LocalDateTime deserialize(JsonParser p, DeserializationContext ctx) throws IOException {
                return LocalDateTime.parse(p.getText(), DateTimeFormatter.ISO_LOCAL_DATE_TIME);
            }
        });

        objectMapper = new ObjectMapper()
                .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
                .disable(MapperFeature.REQUIRE_HANDLERS_FOR_JAVA8_TIMES)
                .registerModule(dateModule);

        EventController controller = new EventController(eventService, profileRepository);
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

    // ─── GET /api/events ─────────────────────────────────────────────────────

    @Test
    @DisplayName("GET /api/events: returns 200 with paginated events")
    void getEvents_returnsOk() throws Exception {
        Page<EventCardResponse> page = new PageImpl<>(
                List.of(sampleCard()), PageRequest.of(0, 12), 1);
        when(eventService.getEvents(any(), any(), any(), any())).thenReturn(page);

        mockMvc.perform(get("/api/events").with(asStudent()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].title").value("NU Open Day"));
    }

    @Test
    @DisplayName("GET /api/events: empty result returns 200 with empty content")
    void getEvents_emptyReturnsOk() throws Exception {
        Page<EventCardResponse> empty = new PageImpl<>(List.of(), PageRequest.of(0, 12), 0);
        when(eventService.getEvents(any(), any(), any(), any())).thenReturn(empty);

        mockMvc.perform(get("/api/events").with(asStudent()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalElements").value(0));
    }

    // ─── GET /api/events/{id} ─────────────────────────────────────────────────

    @Test
    @DisplayName("GET /api/events/{id}: returns 200 with event detail")
    void getEvent_returnsOk() throws Exception {
        when(eventService.getEvent(eq(EVENT_ID), eq(USER_ID))).thenReturn(sampleResponse(false));

        mockMvc.perform(get("/api/events/" + EVENT_ID).with(asStudent()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.title").value("NU Open Day"))
                .andExpect(jsonPath("$.data.isRsvpd").value(false));
    }

    @Test
    @DisplayName("GET /api/events/{id}: not found returns 404")
    void getEvent_notFound_returns404() throws Exception {
        when(eventService.getEvent(eq(EVENT_ID), any()))
                .thenThrow(new ResourceNotFoundException("Event", EVENT_ID));

        mockMvc.perform(get("/api/events/" + EVENT_ID).with(asStudent()))
                .andExpect(status().isNotFound());
    }

    // ─── POST /api/events ─────────────────────────────────────────────────────

    @Test
    @DisplayName("POST /api/events: admin creates event → 201")
    void createEvent_adminReturns201() throws Exception {
        when(eventService.createEvent(eq(USER_ID), any())).thenReturn(sampleResponse(false));

        mockMvc.perform(post("/api/events")
                        .with(asAdmin())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.status").value("DRAFT"));
    }

    @Test
    @DisplayName("POST /api/events: missing title returns 400")
    void createEvent_missingTitle_returns400() throws Exception {
        String startTimeStr = FUTURE.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        String body = "{\"category\":\"ACADEMIC\",\"location\":\"Gym\",\"startTime\":\"" + startTimeStr + "\"}";

        mockMvc.perform(post("/api/events")
                        .with(asAdmin())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest());
    }

    // ─── PATCH /api/events/{id}/publish ──────────────────────────────────────

    @Test
    @DisplayName("PATCH /{id}/publish: publishes event → 200")
    void publishEvent_returnsOk() throws Exception {
        EventResponse published = sampleResponse(false);
        when(eventService.publishEvent(eq(USER_ID), eq(EVENT_ID))).thenReturn(published);

        mockMvc.perform(patch("/api/events/" + EVENT_ID + "/publish").with(asAdmin()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("PATCH /{id}/publish: already published returns 409")
    void publishEvent_conflict_returns409() throws Exception {
        when(eventService.publishEvent(eq(USER_ID), eq(EVENT_ID)))
                .thenThrow(new AppException(HttpStatus.CONFLICT, "Only draft events can be published"));

        mockMvc.perform(patch("/api/events/" + EVENT_ID + "/publish").with(asAdmin()))
                .andExpect(status().isConflict());
    }

    // ─── PATCH /api/events/{id}/cancel ───────────────────────────────────────

    @Test
    @DisplayName("PATCH /{id}/cancel: cancels event → 200")
    void cancelEvent_returnsOk() throws Exception {
        when(eventService.cancelEvent(eq(USER_ID), eq(EVENT_ID))).thenReturn(sampleResponse(false));

        mockMvc.perform(patch("/api/events/" + EVENT_ID + "/cancel").with(asAdmin()))
                .andExpect(status().isOk());
    }

    // ─── DELETE /api/events/{id} ──────────────────────────────────────────────

    @Test
    @DisplayName("DELETE /{id}: deletes draft event → 200")
    void deleteEvent_returnsOk() throws Exception {
        doNothing().when(eventService).deleteEvent(eq(USER_ID), eq(EVENT_ID));

        mockMvc.perform(delete("/api/events/" + EVENT_ID).with(asAdmin()))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("DELETE /{id}: published event returns 409")
    void deleteEvent_published_returns409() throws Exception {
        doThrow(new AppException(HttpStatus.CONFLICT, "Only draft events can be deleted"))
                .when(eventService).deleteEvent(eq(USER_ID), eq(EVENT_ID));

        mockMvc.perform(delete("/api/events/" + EVENT_ID).with(asAdmin()))
                .andExpect(status().isConflict());
    }

    // ─── POST /api/events/{id}/rsvp ───────────────────────────────────────────

    @Test
    @DisplayName("POST /{id}/rsvp: registers user → 200")
    void rsvp_returnsOk() throws Exception {
        when(eventService.rsvp(eq(USER_ID), eq(EVENT_ID))).thenReturn(sampleResponse(true));

        mockMvc.perform(post("/api/events/" + EVENT_ID + "/rsvp").with(asStudent()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.isRsvpd").value(true));
    }

    @Test
    @DisplayName("POST /{id}/rsvp: duplicate returns 409")
    void rsvp_duplicate_returns409() throws Exception {
        when(eventService.rsvp(eq(USER_ID), eq(EVENT_ID))).thenThrow(new DuplicateRsvpException());

        mockMvc.perform(post("/api/events/" + EVENT_ID + "/rsvp").with(asStudent()))
                .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("POST /{id}/rsvp: capacity exceeded returns 409")
    void rsvp_capacityExceeded_returns409() throws Exception {
        when(eventService.rsvp(eq(USER_ID), eq(EVENT_ID))).thenThrow(new EventCapacityExceededException());

        mockMvc.perform(post("/api/events/" + EVENT_ID + "/rsvp").with(asStudent()))
                .andExpect(status().isConflict());
    }

    // ─── DELETE /api/events/{id}/rsvp ────────────────────────────────────────

    @Test
    @DisplayName("DELETE /{id}/rsvp: cancels RSVP → 200")
    void cancelRsvp_returnsOk() throws Exception {
        doNothing().when(eventService).cancelRsvp(eq(USER_ID), eq(EVENT_ID));

        mockMvc.perform(delete("/api/events/" + EVENT_ID + "/rsvp").with(asStudent()))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("DELETE /{id}/rsvp: no RSVP found returns 404")
    void cancelRsvp_notFound_returns404() throws Exception {
        doThrow(new ResourceNotFoundException("RSVP for this event", EVENT_ID))
                .when(eventService).cancelRsvp(eq(USER_ID), eq(EVENT_ID));

        mockMvc.perform(delete("/api/events/" + EVENT_ID + "/rsvp").with(asStudent()))
                .andExpect(status().isNotFound());
    }

    // ─── GET /api/events/my-rsvps ─────────────────────────────────────────────

    @Test
    @DisplayName("GET /my-rsvps: returns paginated RSVP list")
    void getMyRsvps_returnsOk() throws Exception {
        Page<RsvpResponse> page = new PageImpl<>(List.of(sampleRsvpResponse()), PageRequest.of(0, 12), 1);
        when(eventService.getMyRsvps(eq(USER_ID), any())).thenReturn(page);

        mockMvc.perform(get("/api/events/my-rsvps").with(asStudent()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[0].eventTitle").value("NU Open Day"));
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private EventCardResponse sampleCard() {
        return new EventCardResponse(EVENT_ID, "NU Open Day", "ACADEMIC",
                "NU Gym", FUTURE, null, "PUBLISHED", null, 5L, 100);
    }

    private EventResponse sampleResponse(boolean isRsvpd) {
        return new EventResponse(EVENT_ID, USER_ID, "NU Open Day", "Join us!",
                "ACADEMIC", "NU Gym", FUTURE, null, null, 100,
                "DRAFT", 5L, true, isRsvpd, LocalDateTime.now().minusDays(1), 0L, null, 0L);
    }

    private RsvpResponse sampleRsvpResponse() {
        return new RsvpResponse(UUID.randomUUID(), EVENT_ID, "NU Open Day",
                "NU Gym", FUTURE, "PUBLISHED", "ATTENDING", LocalDateTime.now().minusHours(1));
    }

    private CreateEventRequest createRequest() {
        return new CreateEventRequest("NU Open Day", "Join us!", com.nuverse_laguna.modules.events.domain.EventCategory.ACADEMIC,
                "NU Gym", FUTURE, null, null, 100);
    }

    private RequestPostProcessor asStudent() {
        return buildAuth("ROLE_STUDENT");
    }

    private RequestPostProcessor asAdmin() {
        return buildAuth("ROLE_ADMIN");
    }

    private RequestPostProcessor buildAuth(String role) {
        Authentication auth = new UsernamePasswordAuthenticationToken(
                USER_ID.toString(), null,
                List.of(new SimpleGrantedAuthority(role))
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
