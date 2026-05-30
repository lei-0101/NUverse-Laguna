package com.nuverse_laguna.modules.marketplace.controller;

import com.fasterxml.jackson.databind.MapperFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.nuverse_laguna.modules.marketplace.application.MarketplaceService;
import com.nuverse_laguna.modules.marketplace.domain.ListingCategory;
import com.nuverse_laguna.modules.marketplace.domain.ListingCondition;
import com.nuverse_laguna.modules.marketplace.dto.CreateListingRequest;
import com.nuverse_laguna.modules.marketplace.dto.ListingCardResponse;
import com.nuverse_laguna.modules.marketplace.dto.ListingResponse;
import com.nuverse_laguna.modules.marketplace.dto.ReportListingRequest;
import com.nuverse_laguna.modules.marketplace.dto.UpdateListingRequest;
import com.nuverse_laguna.shared.exception.AppException;
import com.nuverse_laguna.shared.handler.GlobalExceptionHandler;
import com.nuverse_laguna.shared.profile.ProfileSummary;
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

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("MarketplaceController")
class MarketplaceControllerTest {

    @Mock MarketplaceService marketplaceService;

    MockMvc mockMvc;
    ObjectMapper objectMapper;

    static final UUID USER_ID = UUID.randomUUID();
    static final UUID LISTING_ID = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper()
                .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
                .disable(MapperFeature.REQUIRE_HANDLERS_FOR_JAVA8_TIMES);
        MarketplaceController controller = new MarketplaceController(marketplaceService);
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

    // ─── GET /api/marketplace ─────────────────────────────────────────────────

    @Test
    @DisplayName("GET /api/marketplace: returns 200 with paginated listing cards")
    void getListings_returnsOk() throws Exception {
        Page<ListingCardResponse> page = new PageImpl<>(List.of(sampleCard()), PageRequest.of(0, 12), 1);
        when(marketplaceService.getListings(any(), any(), any(), any(), any(), any()))
                .thenReturn(page);

        mockMvc.perform(get("/api/marketplace")
                        .with(asUser(studentAuth())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("GET /api/marketplace: category and keyword params forwarded to service")
    void getListings_withFilters_forwardsToService() throws Exception {
        Page<ListingCardResponse> page = new PageImpl<>(List.of(), PageRequest.of(0, 12), 0);
        when(marketplaceService.getListings(any(), any(), any(), any(), any(), any()))
                .thenReturn(page);

        mockMvc.perform(get("/api/marketplace")
                        .param("keyword", "textbook")
                        .param("category", "BOOKS")
                        .with(asUser(studentAuth())))
                .andExpect(status().isOk());

        verify(marketplaceService).getListings(eq("textbook"), eq(ListingCategory.BOOKS), any(), any(), any(), any());
    }

    // ─── POST /api/marketplace/images ─────────────────────────────────────────

    @Test
    @DisplayName("POST /api/marketplace/images: returns 201 with the stored image URL")
    void uploadImage_returnsCreatedWithUrl() throws Exception {
        when(marketplaceService.uploadImage(any()))
                .thenReturn(new com.nuverse_laguna.modules.marketplace.dto.UploadImageResponse(
                        "/uploads/listings/x.png"));

        var file = new org.springframework.mock.web.MockMultipartFile(
                "file", "x.png", "image/png", new byte[]{1, 2, 3});

        mockMvc.perform(multipart("/api/marketplace/images").file(file)
                        .with(asUser(studentAuth())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.url").value("/uploads/listings/x.png"));
    }

    // ─── GET /api/marketplace/{id} ────────────────────────────────────────────

    @Test
    @DisplayName("GET /api/marketplace/{id}: returns 200 with listing detail")
    void getListing_returnsOk() throws Exception {
        when(marketplaceService.getListing(eq(LISTING_ID), any())).thenReturn(sampleDetail());

        mockMvc.perform(get("/api/marketplace/" + LISTING_ID)
                        .with(asUser(studentAuth())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.title").value("Test Listing"));
    }

    @Test
    @DisplayName("GET /api/marketplace/{id}: service 404 propagates to client")
    void getListing_notFound_returns404() throws Exception {
        when(marketplaceService.getListing(eq(LISTING_ID), any()))
                .thenThrow(new AppException(HttpStatus.NOT_FOUND, "Listing not found"));

        mockMvc.perform(get("/api/marketplace/" + LISTING_ID)
                        .with(asUser(studentAuth())))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));
    }

    // ─── POST /api/marketplace ────────────────────────────────────────────────

    @Test
    @DisplayName("POST /api/marketplace: valid request returns 201")
    void createListing_valid_returns201() throws Exception {
        CreateListingRequest request = new CreateListingRequest(
                "Old Textbook", "Good condition", BigDecimal.valueOf(150),
                ListingCategory.BOOKS, ListingCondition.GOOD, null
        );
        when(marketplaceService.createListing(any(), any())).thenReturn(sampleDetail());

        mockMvc.perform(post("/api/marketplace")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request))
                        .with(asUser(studentAuth())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("POST /api/marketplace: blank title returns 400")
    void createListing_blankTitle_returns400() throws Exception {
        String body = "{\"title\":\"\",\"description\":\"Desc\",\"price\":100,\"category\":\"BOOKS\",\"condition\":\"GOOD\"}";

        mockMvc.perform(post("/api/marketplace")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body)
                        .with(asUser(studentAuth())))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));

        verifyNoInteractions(marketplaceService);
    }

    @Test
    @DisplayName("POST /api/marketplace: negative price returns 400")
    void createListing_negativePrice_returns400() throws Exception {
        String body = "{\"title\":\"Book\",\"description\":\"Desc\",\"price\":-1,\"category\":\"BOOKS\",\"condition\":\"GOOD\"}";

        mockMvc.perform(post("/api/marketplace")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body)
                        .with(asUser(studentAuth())))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(marketplaceService);
    }

    @Test
    @DisplayName("POST /api/marketplace: malformed JSON returns 400")
    void createListing_malformedJson_returns400() throws Exception {
        mockMvc.perform(post("/api/marketplace")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{not-valid-json}")
                        .with(asUser(studentAuth())))
                .andExpect(status().isBadRequest());
    }

    // ─── PUT /api/marketplace/{id} ────────────────────────────────────────────

    @Test
    @DisplayName("PUT /api/marketplace/{id}: valid request returns 200")
    void updateListing_valid_returnsOk() throws Exception {
        UpdateListingRequest request = new UpdateListingRequest(
                "Updated Laptop", "Still works great", BigDecimal.valueOf(2500),
                ListingCategory.GADGETS, ListingCondition.LIKE_NEW, null
        );
        when(marketplaceService.updateListing(any(), eq(LISTING_ID), any())).thenReturn(sampleDetail());

        mockMvc.perform(put("/api/marketplace/" + LISTING_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request))
                        .with(asUser(studentAuth())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("PUT /api/marketplace/{id}: missing description returns 400")
    void updateListing_missingDescription_returns400() throws Exception {
        String body = "{\"title\":\"T\",\"price\":100,\"category\":\"BOOKS\",\"condition\":\"GOOD\"}";

        mockMvc.perform(put("/api/marketplace/" + LISTING_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body)
                        .with(asUser(studentAuth())))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(marketplaceService);
    }

    @Test
    @DisplayName("PUT /api/marketplace/{id}: service 403 propagates to client")
    void updateListing_notOwner_returns403() throws Exception {
        UpdateListingRequest request = new UpdateListingRequest(
                "T", "D", BigDecimal.valueOf(100), ListingCategory.BOOKS, ListingCondition.GOOD, null
        );
        when(marketplaceService.updateListing(any(), eq(LISTING_ID), any()))
                .thenThrow(new AppException(HttpStatus.FORBIDDEN, "You do not own this listing"));

        mockMvc.perform(put("/api/marketplace/" + LISTING_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request))
                        .with(asUser(studentAuth())))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false));
    }

    // ─── PATCH /api/marketplace/{id}/sold ─────────────────────────────────────

    @Test
    @DisplayName("PATCH /api/marketplace/{id}/sold: returns 200")
    void markAsSold_returnsOk() throws Exception {
        when(marketplaceService.markAsSold(any(), eq(LISTING_ID))).thenReturn(sampleDetail());

        mockMvc.perform(patch("/api/marketplace/" + LISTING_ID + "/sold")
                        .with(asUser(studentAuth())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    // ─── DELETE /api/marketplace/{id} ─────────────────────────────────────────

    @Test
    @DisplayName("DELETE /api/marketplace/{id}: returns 200")
    void removeListing_returnsOk() throws Exception {
        doNothing().when(marketplaceService).removeListing(any(), eq(LISTING_ID));

        mockMvc.perform(delete("/api/marketplace/" + LISTING_ID)
                        .with(asUser(studentAuth())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    // ─── POST /api/marketplace/{id}/save ──────────────────────────────────────

    @Test
    @DisplayName("POST /api/marketplace/{id}/save: returns 200")
    void saveListing_returnsOk() throws Exception {
        doNothing().when(marketplaceService).saveListing(any(), eq(LISTING_ID));

        mockMvc.perform(post("/api/marketplace/" + LISTING_ID + "/save")
                        .with(asUser(studentAuth())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("POST /api/marketplace/{id}/save: service 409 propagates to client")
    void saveListing_alreadySaved_returns409() throws Exception {
        doThrow(new AppException(HttpStatus.CONFLICT, "Listing is already saved"))
                .when(marketplaceService).saveListing(any(), eq(LISTING_ID));

        mockMvc.perform(post("/api/marketplace/" + LISTING_ID + "/save")
                        .with(asUser(studentAuth())))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false));
    }

    // ─── DELETE /api/marketplace/{id}/save ────────────────────────────────────

    @Test
    @DisplayName("DELETE /api/marketplace/{id}/save: returns 200")
    void unsaveListing_returnsOk() throws Exception {
        doNothing().when(marketplaceService).unsaveListing(any(), eq(LISTING_ID));

        mockMvc.perform(delete("/api/marketplace/" + LISTING_ID + "/save")
                        .with(asUser(studentAuth())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    // ─── POST /api/marketplace/{id}/report ────────────────────────────────────

    @Test
    @DisplayName("POST /api/marketplace/{id}/report: valid request returns 201")
    void reportListing_valid_returns201() throws Exception {
        ReportListingRequest request = new ReportListingRequest("This is spam");
        doNothing().when(marketplaceService).reportListing(any(), eq(LISTING_ID), any());

        mockMvc.perform(post("/api/marketplace/" + LISTING_ID + "/report")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request))
                        .with(asUser(studentAuth())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("POST /api/marketplace/{id}/report: blank reason returns 400")
    void reportListing_blankReason_returns400() throws Exception {
        mockMvc.perform(post("/api/marketplace/" + LISTING_ID + "/report")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"reason\":\"\"}")
                        .with(asUser(studentAuth())))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(marketplaceService);
    }

    @Test
    @DisplayName("POST /api/marketplace/{id}/report: duplicate report returns 409")
    void reportListing_duplicate_returns409() throws Exception {
        ReportListingRequest request = new ReportListingRequest("Spam");
        doThrow(new AppException(HttpStatus.CONFLICT, "You have already reported this listing"))
                .when(marketplaceService).reportListing(any(), eq(LISTING_ID), any());

        mockMvc.perform(post("/api/marketplace/" + LISTING_ID + "/report")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request))
                        .with(asUser(studentAuth())))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false));
    }

    // ─── GET /api/marketplace/my-listings ─────────────────────────────────────

    @Test
    @DisplayName("GET /api/marketplace/my-listings: returns 200")
    void getMyListings_returnsOk() throws Exception {
        Page<ListingCardResponse> page = new PageImpl<>(List.of(sampleCard()), PageRequest.of(0, 12), 1);
        when(marketplaceService.getMyListings(any(), any())).thenReturn(page);

        mockMvc.perform(get("/api/marketplace/my-listings")
                        .with(asUser(studentAuth())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    // ─── GET /api/marketplace/saved ───────────────────────────────────────────

    @Test
    @DisplayName("GET /api/marketplace/saved: returns 200")
    void getSavedListings_returnsOk() throws Exception {
        Page<ListingCardResponse> page = new PageImpl<>(List.of(sampleCard()), PageRequest.of(0, 12), 1);
        when(marketplaceService.getSavedListings(any(), any())).thenReturn(page);

        mockMvc.perform(get("/api/marketplace/saved")
                        .with(asUser(studentAuth())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    // ─── PATCH /api/marketplace/{id}/suspend ──────────────────────────────────

    @Test
    @DisplayName("PATCH /api/marketplace/{id}/suspend: admin request returns 200")
    void suspendListing_admin_returnsOk() throws Exception {
        when(marketplaceService.suspendListing(LISTING_ID)).thenReturn(sampleDetail());

        mockMvc.perform(patch("/api/marketplace/" + LISTING_ID + "/suspend")
                        .with(asUser(adminAuth())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private UsernamePasswordAuthenticationToken studentAuth() {
        return new UsernamePasswordAuthenticationToken(
                USER_ID.toString(), null,
                List.of(new SimpleGrantedAuthority("ROLE_STUDENT"))
        );
    }

    private UsernamePasswordAuthenticationToken adminAuth() {
        return new UsernamePasswordAuthenticationToken(
                USER_ID.toString(), null,
                List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))
        );
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

    private ListingResponse sampleDetail() {
        ProfileSummary seller = new ProfileSummary(USER_ID, "Juan Dela Cruz", null);
        return new ListingResponse(
                LISTING_ID, "Test Listing", "Great item",
                BigDecimal.valueOf(150), "BOOKS", "GOOD", "AVAILABLE",
                List.of(), seller, false,
                LocalDateTime.now(), LocalDateTime.now()
        );
    }

    private ListingCardResponse sampleCard() {
        ProfileSummary seller = new ProfileSummary(USER_ID, "Juan Dela Cruz", null);
        return new ListingCardResponse(
                LISTING_ID, "Test Listing", BigDecimal.valueOf(150),
                "BOOKS", "GOOD", "AVAILABLE", "/uploads/listings/thumb.png",
                seller, LocalDateTime.now()
        );
    }
}
