package com.nuverse_laguna.modules.lostfound.controller;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.*;
import com.fasterxml.jackson.databind.deser.std.StdDeserializer;
import com.fasterxml.jackson.databind.module.SimpleModule;
import com.fasterxml.jackson.databind.ser.std.StdSerializer;
import com.nuverse_laguna.modules.lostfound.application.LostFoundService;
import com.nuverse_laguna.modules.lostfound.dto.CreateLostFoundRequest;
import com.nuverse_laguna.modules.lostfound.dto.LostFoundItemResponse;
import com.nuverse_laguna.modules.lostfound.dto.UploadImageResponse;
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
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@DisplayName("LostFoundController")
class LostFoundControllerTest {

    @Mock LostFoundService lostFoundService;
    @Mock com.nuverse_laguna.modules.profile.repository.UserProfileRepository profileRepository;

    MockMvc mockMvc;
    ObjectMapper objectMapper;

    static final UUID USER_ID = UUID.randomUUID();
    static final UUID ITEM_ID = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        SimpleModule dateModule = new SimpleModule();
        dateModule.addSerializer(LocalDate.class, new StdSerializer<>(LocalDate.class) {
            @Override public void serialize(LocalDate v, JsonGenerator g, SerializerProvider p) throws IOException {
                g.writeString(v.format(DateTimeFormatter.ISO_LOCAL_DATE));
            }
        });
        dateModule.addDeserializer(LocalDate.class, new StdDeserializer<>(LocalDate.class) {
            @Override public LocalDate deserialize(JsonParser p, DeserializationContext ctx) throws IOException {
                return LocalDate.parse(p.getText(), DateTimeFormatter.ISO_LOCAL_DATE);
            }
        });
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
        LostFoundController controller = new LostFoundController(lostFoundService, profileRepository);
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

    // ── POST /api/lost-found/images ───────────────────────────────────────────

    @Test
    @DisplayName("POST /images: upload returns 201 with URL")
    void uploadImage_returns201() throws Exception {
        when(lostFoundService.uploadImage(any()))
                .thenReturn(new UploadImageResponse("/uploads/lostfound/abc.jpg"));

        MockMultipartFile file = new MockMultipartFile("file", "photo.jpg", "image/jpeg", new byte[]{1, 2, 3});

        mockMvc.perform(multipart("/api/lost-found/images").file(file)
                        .with(asUser(studentAuth())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.url").value("/uploads/lostfound/abc.jpg"));
    }

    // ── GET /api/lost-found ───────────────────────────────────────────────────

    @Test
    @DisplayName("GET /api/lost-found: returns 200 with paginated OPEN items")
    void browse_returnsOk() throws Exception {
        Page<LostFoundItemResponse> page = new PageImpl<>(
                List.of(sampleItem()), PageRequest.of(0, 12), 1);
        when(lostFoundService.browse(any(), any(), any(), any())).thenReturn(page);

        mockMvc.perform(get("/api/lost-found")
                        .with(asUser(studentAuth())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[0].title").value("Lost umbrella"))
                .andExpect(jsonPath("$.data.content[0].type").value("LOST"));
    }

    @Test
    @DisplayName("GET /api/lost-found: type and status filters are forwarded to service")
    void browse_withFilters_forwardsToService() throws Exception {
        when(lostFoundService.browse(any(), any(), any(), any()))
                .thenReturn(new PageImpl<>(List.of(), PageRequest.of(0, 12), 0));

        mockMvc.perform(get("/api/lost-found")
                        .param("type", "FOUND")
                        .param("status", "OPEN")
                        .with(asUser(studentAuth())))
                .andExpect(status().isOk());

        verify(lostFoundService).browse(eq("FOUND"), eq("OPEN"), any(), any());
    }

    // ── GET /api/lost-found/mine ──────────────────────────────────────────────

    @Test
    @DisplayName("GET /mine: returns 200 with user's items")
    void getMine_returnsOk() throws Exception {
        Page<LostFoundItemResponse> page = new PageImpl<>(
                List.of(sampleItem()), PageRequest.of(0, 12), 1);
        when(lostFoundService.getMine(any(), any())).thenReturn(page);

        mockMvc.perform(get("/api/lost-found/mine")
                        .with(asUser(studentAuth())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[0].title").value("Lost umbrella"));
    }

    // ── POST /api/lost-found ──────────────────────────────────────────────────

    @Test
    @DisplayName("POST /api/lost-found: create returns 201")
    void create_returns201() throws Exception {
        CreateLostFoundRequest request = new CreateLostFoundRequest(
                "LOST", "Lost umbrella", "Black foldable umbrella",
                "Library 3rd floor", LocalDate.now(), null,
                "student@students.nu-laguna.edu.ph");
        when(lostFoundService.create(any(), any())).thenReturn(sampleItem());

        mockMvc.perform(post("/api/lost-found")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request))
                        .with(asUser(studentAuth())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.type").value("LOST"));
    }

    @Test
    @DisplayName("POST /api/lost-found: blank title returns 400")
    void create_blankTitle_returns400() throws Exception {
        String body = "{\"type\":\"LOST\",\"title\":\"\",\"description\":\"Desc\"," +
                "\"location\":\"Library\",\"itemDate\":\"2026-05-31\"," +
                "\"contact\":\"student@students.nu-laguna.edu.ph\"}";

        mockMvc.perform(post("/api/lost-found")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body)
                        .with(asUser(studentAuth())))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));

        verifyNoInteractions(lostFoundService);
    }

    // ── PATCH /api/lost-found/{id}/resolve ───────────────────────────────────

    @Test
    @DisplayName("PATCH /resolve: owner resolves item — returns 200 with RESOLVED status")
    void resolve_owner_returnsOk() throws Exception {
        LostFoundItemResponse resolved = new LostFoundItemResponse(
                ITEM_ID, USER_ID, "Alex", "LOST", "RESOLVED",
                "Lost umbrella", "Black umbrella", "Library",
                LocalDate.now(), null, "contact@example.com", LocalDateTime.now(), 0L, null, 0);
        when(lostFoundService.resolve(eq(ITEM_ID), any())).thenReturn(resolved);

        mockMvc.perform(patch("/api/lost-found/" + ITEM_ID + "/resolve")
                        .with(asUser(studentAuth())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("RESOLVED"));
    }

    @Test
    @DisplayName("PATCH /resolve: non-owner gets 403")
    void resolve_nonOwner_returns403() throws Exception {
        when(lostFoundService.resolve(eq(ITEM_ID), any()))
                .thenThrow(new AppException(HttpStatus.FORBIDDEN, "Only the reporter can mark this item as resolved"));

        mockMvc.perform(patch("/api/lost-found/" + ITEM_ID + "/resolve")
                        .with(asUser(studentAuth())))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("PATCH /resolve: already resolved returns 409")
    void resolve_alreadyResolved_returns409() throws Exception {
        when(lostFoundService.resolve(eq(ITEM_ID), any()))
                .thenThrow(new AppException(HttpStatus.CONFLICT, "Item is already resolved"));

        mockMvc.perform(patch("/api/lost-found/" + ITEM_ID + "/resolve")
                        .with(asUser(studentAuth())))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false));
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private LostFoundItemResponse sampleItem() {
        return new LostFoundItemResponse(
                ITEM_ID, USER_ID, "Alex Dela Cruz", "LOST", "OPEN",
                "Lost umbrella", "Black foldable umbrella",
                "Library 3rd floor", LocalDate.now(), null,
                "student@students.nu-laguna.edu.ph", LocalDateTime.now(), 0L, null, 0);
    }

    private UsernamePasswordAuthenticationToken studentAuth() {
        return new UsernamePasswordAuthenticationToken(
                USER_ID.toString(), null,
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
