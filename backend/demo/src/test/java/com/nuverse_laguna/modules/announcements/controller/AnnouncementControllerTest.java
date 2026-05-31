package com.nuverse_laguna.modules.announcements.controller;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.*;
import com.fasterxml.jackson.databind.deser.std.StdDeserializer;
import com.fasterxml.jackson.databind.module.SimpleModule;
import com.fasterxml.jackson.databind.ser.std.StdSerializer;
import com.nuverse_laguna.modules.announcements.application.AnnouncementService;
import com.nuverse_laguna.modules.announcements.dto.AnnouncementResponse;
import com.nuverse_laguna.modules.announcements.dto.CreateAnnouncementRequest;
import com.nuverse_laguna.shared.exception.AppException;
import com.nuverse_laguna.shared.handler.GlobalExceptionHandler;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
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

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@DisplayName("AnnouncementController")
class AnnouncementControllerTest {

    @Mock AnnouncementService announcementService;

    MockMvc mockMvc;
    ObjectMapper objectMapper;

    static final UUID ADMIN_ID = UUID.randomUUID();
    static final UUID ANN_ID   = UUID.randomUUID();

    @BeforeEach
    void setUp() {
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
        AnnouncementController controller = new AnnouncementController(announcementService);
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

    // ── GET /api/announcements/active ─────────────────────────────────────────

    @Test
    @DisplayName("GET /active: returns list of effective announcements")
    void getActive_returnsOk() throws Exception {
        when(announcementService.getEffective()).thenReturn(List.of(sampleAnn()));

        mockMvc.perform(get("/api/announcements/active"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].title").value("Enrollment Open"));
    }

    @Test
    @DisplayName("GET /active: empty list returns 200 with empty array")
    void getActive_empty_returnsEmptyList() throws Exception {
        when(announcementService.getEffective()).thenReturn(List.of());

        mockMvc.perform(get("/api/announcements/active"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data").isEmpty());
    }

    // ── GET /api/announcements ────────────────────────────────────────────────

    @Test
    @DisplayName("GET /api/announcements: admin gets paginated list")
    void getAll_admin_returnsOk() throws Exception {
        Page<AnnouncementResponse> page = new PageImpl<>(
                List.of(sampleAnn()), PageRequest.of(0, 20), 1);
        when(announcementService.getAll(any())).thenReturn(page);

        mockMvc.perform(get("/api/announcements")
                        .with(asUser(adminAuth())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[0].title").value("Enrollment Open"));
    }

    // ── POST /api/announcements ───────────────────────────────────────────────

    @Test
    @DisplayName("POST /api/announcements: admin creates announcement — returns 201")
    void create_admin_returns201() throws Exception {
        CreateAnnouncementRequest request = new CreateAnnouncementRequest(
                "Enrollment Open", "Portal is open.", "IMPORTANT",
                LocalDateTime.now().plusDays(7), null);
        when(announcementService.create(any(), any())).thenReturn(sampleAnn());

        mockMvc.perform(post("/api/announcements")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request))
                        .with(asUser(adminAuth())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.title").value("Enrollment Open"));
    }

    @Test
    @DisplayName("POST /api/announcements: blank title returns 400")
    void create_blankTitle_returns400() throws Exception {
        String body = "{\"title\":\"\",\"body\":\"Test body\",\"priority\":\"NORMAL\"}";

        mockMvc.perform(post("/api/announcements")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body)
                        .with(asUser(adminAuth())))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));

        verifyNoInteractions(announcementService);
    }

    @Test
    @DisplayName("POST /api/announcements: invalid priority returns 400")
    void create_invalidPriority_returns400() throws Exception {
        CreateAnnouncementRequest request = new CreateAnnouncementRequest(
                "Test", "Body", "INVALID", null, null);
        when(announcementService.create(any(), any()))
                .thenThrow(new AppException(HttpStatus.BAD_REQUEST, "Invalid priority: INVALID"));

        mockMvc.perform(post("/api/announcements")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request))
                        .with(asUser(adminAuth())))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    // ── PATCH /api/announcements/{id}/deactivate ──────────────────────────────

    @Test
    @DisplayName("PATCH /deactivate: admin deactivates — returns 200 with active=false")
    void deactivate_admin_returnsOk() throws Exception {
        AnnouncementResponse deactivated = new AnnouncementResponse(
                ANN_ID, "Enrollment Open", "Body", "IMPORTANT", ADMIN_ID,
                false, LocalDateTime.now().plusDays(7), LocalDateTime.now(), null, 0L, null);
        when(announcementService.deactivate(any(), any())).thenReturn(deactivated);

        mockMvc.perform(patch("/api/announcements/" + ANN_ID + "/deactivate")
                        .with(asUser(adminAuth())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.active").value(false));
    }

    @Test
    @DisplayName("PATCH /deactivate: not found returns 404")
    void deactivate_notFound_returns404() throws Exception {
        when(announcementService.deactivate(any(), any()))
                .thenThrow(new AppException(HttpStatus.NOT_FOUND, "Announcement not found"));

        mockMvc.perform(patch("/api/announcements/" + ANN_ID + "/deactivate")
                        .with(asUser(adminAuth())))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private AnnouncementResponse sampleAnn() {
        return new AnnouncementResponse(
                ANN_ID, "Enrollment Open", "Portal is open.", "IMPORTANT",
                ADMIN_ID, true, LocalDateTime.now().plusDays(7), LocalDateTime.now(), null, 0L, null);
    }

    private UsernamePasswordAuthenticationToken adminAuth() {
        return new UsernamePasswordAuthenticationToken(
                ADMIN_ID.toString(), null,
                List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));
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
