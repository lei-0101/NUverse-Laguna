package com.nuverse_laguna.modules.bulldog_exchange.controller;

import com.fasterxml.jackson.databind.MapperFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.nuverse_laguna.modules.bulldog_exchange.application.BulldogExchangeService;
import com.nuverse_laguna.modules.bulldog_exchange.domain.MerchandiseCategory;
import com.nuverse_laguna.modules.bulldog_exchange.dto.*;
import com.nuverse_laguna.shared.exception.AppException;
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
import org.springframework.mock.web.MockMultipartFile;
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
@DisplayName("BulldogExchangeController")
class BulldogExchangeControllerTest {

    @Mock BulldogExchangeService exchangeService;

    MockMvc mockMvc;
    ObjectMapper objectMapper;

    static final UUID USER_ID = UUID.randomUUID();
    static final UUID PRODUCT_ID = UUID.randomUUID();
    static final UUID VARIANT_ID = UUID.randomUUID();
    static final UUID RESERVATION_ID = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper()
                .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
                .disable(MapperFeature.REQUIRE_HANDLERS_FOR_JAVA8_TIMES);
        BulldogExchangeController controller = new BulldogExchangeController(exchangeService);
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

    // ─── POST /api/bulldog-exchange/images ────────────────────────────────────

    @Test
    @DisplayName("POST /images: admin upload returns 201 with URL")
    void uploadImage_admin_returns201WithUrl() throws Exception {
        when(exchangeService.uploadImage(any()))
                .thenReturn(new UploadImageResponse("/uploads/exchange/abc.png"));

        MockMultipartFile file = new MockMultipartFile(
                "file", "shirt.png", "image/png", new byte[]{1, 2, 3});

        mockMvc.perform(multipart("/api/bulldog-exchange/images").file(file)
                        .with(asUser(adminAuth())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.url").value("/uploads/exchange/abc.png"));
    }

    @Test
    @DisplayName("POST /images: service error propagates to client")
    void uploadImage_storageFailure_returns400() throws Exception {
        when(exchangeService.uploadImage(any()))
                .thenThrow(new AppException(HttpStatus.BAD_REQUEST, "Unsupported image format"));

        MockMultipartFile file = new MockMultipartFile(
                "file", "doc.pdf", "application/pdf", new byte[]{1, 2, 3});

        mockMvc.perform(multipart("/api/bulldog-exchange/images").file(file)
                        .with(asUser(adminAuth())))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    // ─── GET /api/bulldog-exchange ────────────────────────────────────────────

    @Test
    @DisplayName("GET /api/bulldog-exchange: returns 200 with paginated product cards")
    void getProducts_returnsOk() throws Exception {
        Page<ProductCardResponse> page = new PageImpl<>(
                List.of(sampleCard()), PageRequest.of(0, 12), 1);
        when(exchangeService.getProducts(any(), any())).thenReturn(page);

        mockMvc.perform(get("/api/bulldog-exchange")
                        .with(asUser(studentAuth())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].name").value("NU Shirt"));
    }

    @Test
    @DisplayName("GET /api/bulldog-exchange: category filter is forwarded to service")
    void getProducts_withCategoryFilter_forwardsToService() throws Exception {
        Page<ProductCardResponse> page = new PageImpl<>(List.of(), PageRequest.of(0, 12), 0);
        when(exchangeService.getProducts(any(), any())).thenReturn(page);

        mockMvc.perform(get("/api/bulldog-exchange")
                        .param("category", "CLOTHING")
                        .with(asUser(studentAuth())))
                .andExpect(status().isOk());

        verify(exchangeService).getProducts(eq(MerchandiseCategory.CLOTHING), any());
    }

    // ─── GET /api/bulldog-exchange/{productId} ────────────────────────────────

    @Test
    @DisplayName("GET /api/bulldog-exchange/{id}: returns 200 with product detail")
    void getProduct_found_returnsOk() throws Exception {
        when(exchangeService.getProduct(PRODUCT_ID)).thenReturn(sampleDetail());

        mockMvc.perform(get("/api/bulldog-exchange/" + PRODUCT_ID)
                        .with(asUser(studentAuth())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.name").value("NU Shirt"));
    }

    @Test
    @DisplayName("GET /api/bulldog-exchange/{id}: not found returns 404")
    void getProduct_notFound_returns404() throws Exception {
        when(exchangeService.getProduct(PRODUCT_ID))
                .thenThrow(new AppException(HttpStatus.NOT_FOUND, "Product not found"));

        mockMvc.perform(get("/api/bulldog-exchange/" + PRODUCT_ID)
                        .with(asUser(studentAuth())))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));
    }

    // ─── POST /api/bulldog-exchange (admin) ───────────────────────────────────

    @Test
    @DisplayName("POST /api/bulldog-exchange: admin creates product — returns 201")
    void createProduct_admin_returns201() throws Exception {
        CreateProductRequest request = new CreateProductRequest(
                "NU Hoodie", "Warm hoodie", null, MerchandiseCategory.CLOTHING);
        when(exchangeService.createProduct(any())).thenReturn(sampleDetail());

        mockMvc.perform(post("/api/bulldog-exchange")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request))
                        .with(asUser(adminAuth())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("POST /api/bulldog-exchange: blank name returns 400")
    void createProduct_blankName_returns400() throws Exception {
        String body = "{\"name\":\"\",\"description\":\"Desc\",\"category\":\"CLOTHING\"}";

        mockMvc.perform(post("/api/bulldog-exchange")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body)
                        .with(asUser(adminAuth())))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));

        verifyNoInteractions(exchangeService);
    }

    // ─── PUT /api/bulldog-exchange/{productId} (admin) ────────────────────────

    @Test
    @DisplayName("PUT /api/bulldog-exchange/{id}: admin updates product — returns 200")
    void updateProduct_admin_returnsOk() throws Exception {
        UpdateProductRequest request = new UpdateProductRequest(
                "NU Shirt v2", "Updated description", null, MerchandiseCategory.CLOTHING);
        when(exchangeService.updateProduct(eq(PRODUCT_ID), any())).thenReturn(sampleDetail());

        mockMvc.perform(put("/api/bulldog-exchange/" + PRODUCT_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request))
                        .with(asUser(adminAuth())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    // ─── DELETE /api/bulldog-exchange/{productId} (admin) ────────────────────

    @Test
    @DisplayName("DELETE /api/bulldog-exchange/{id}: admin deactivates product — returns 200")
    void deactivateProduct_admin_returnsOk() throws Exception {
        doNothing().when(exchangeService).deactivateProduct(PRODUCT_ID);

        mockMvc.perform(delete("/api/bulldog-exchange/" + PRODUCT_ID)
                        .with(asUser(adminAuth())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    // ─── POST /api/bulldog-exchange/{productId}/variants (admin) ─────────────

    @Test
    @DisplayName("POST /{id}/variants: admin adds variant — returns 201")
    void addVariant_admin_returns201() throws Exception {
        AddVariantRequest request = new AddVariantRequest(
                "M", "Blue", "SKU-M-BLUE", 10, BigDecimal.valueOf(299));
        when(exchangeService.addVariant(eq(PRODUCT_ID), any())).thenReturn(sampleDetail());

        mockMvc.perform(post("/api/bulldog-exchange/" + PRODUCT_ID + "/variants")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request))
                        .with(asUser(adminAuth())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("POST /{id}/variants: blank SKU returns 400")
    void addVariant_blankSku_returns400() throws Exception {
        String body = "{\"sku\":\"\",\"stock\":5,\"price\":299}";

        mockMvc.perform(post("/api/bulldog-exchange/" + PRODUCT_ID + "/variants")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body)
                        .with(asUser(adminAuth())))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(exchangeService);
    }

    @Test
    @DisplayName("POST /{id}/variants: negative stock returns 400")
    void addVariant_negativeStock_returns400() throws Exception {
        String body = "{\"sku\":\"SKU-1\",\"stock\":-1,\"price\":299}";

        mockMvc.perform(post("/api/bulldog-exchange/" + PRODUCT_ID + "/variants")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body)
                        .with(asUser(adminAuth())))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(exchangeService);
    }

    @Test
    @DisplayName("POST /{id}/variants: duplicate SKU returns 409")
    void addVariant_duplicateSku_returns409() throws Exception {
        AddVariantRequest request = new AddVariantRequest(
                "M", "Blue", "EXISTING-SKU", 5, BigDecimal.valueOf(200));
        when(exchangeService.addVariant(eq(PRODUCT_ID), any()))
                .thenThrow(new AppException(HttpStatus.CONFLICT, "SKU 'EXISTING-SKU' is already in use"));

        mockMvc.perform(post("/api/bulldog-exchange/" + PRODUCT_ID + "/variants")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request))
                        .with(asUser(adminAuth())))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false));
    }

    // ─── PATCH /api/bulldog-exchange/variants/{variantId}/stock (admin) ───────

    @Test
    @DisplayName("PATCH /variants/{id}/stock: admin updates stock — returns 200")
    void updateVariantStock_admin_returnsOk() throws Exception {
        VariantResponse variant = new VariantResponse(
                VARIANT_ID, "M", "Blue", "SKU-001", 20, BigDecimal.valueOf(299), true);
        when(exchangeService.updateVariantStock(eq(VARIANT_ID), any())).thenReturn(variant);

        String body = "{\"stock\":20}";
        mockMvc.perform(patch("/api/bulldog-exchange/variants/" + VARIANT_ID + "/stock")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body)
                        .with(asUser(adminAuth())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.stock").value(20));
    }

    @Test
    @DisplayName("PATCH /variants/{id}/stock: negative stock returns 400")
    void updateVariantStock_negativeStock_returns400() throws Exception {
        String body = "{\"stock\":-1}";

        mockMvc.perform(patch("/api/bulldog-exchange/variants/" + VARIANT_ID + "/stock")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body)
                        .with(asUser(adminAuth())))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(exchangeService);
    }

    // ─── POST /api/bulldog-exchange/variants/{variantId}/reserve ─────────────

    @Test
    @DisplayName("POST /variants/{id}/reserve: student creates reservation — returns 201")
    void createReservation_student_returns201() throws Exception {
        when(exchangeService.createReservation(any(), eq(VARIANT_ID)))
                .thenReturn(sampleReservation());

        mockMvc.perform(post("/api/bulldog-exchange/variants/" + VARIANT_ID + "/reserve")
                        .with(asUser(studentAuth())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.status").value("PENDING"));
    }

    @Test
    @DisplayName("POST /variants/{id}/reserve: insufficient stock returns 409")
    void createReservation_noStock_returns409() throws Exception {
        when(exchangeService.createReservation(any(), eq(VARIANT_ID)))
                .thenThrow(new com.nuverse_laguna.modules.bulldog_exchange.domain.InsufficientStockException());

        mockMvc.perform(post("/api/bulldog-exchange/variants/" + VARIANT_ID + "/reserve")
                        .with(asUser(studentAuth())))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("POST /variants/{id}/reserve: reservation limit exceeded returns 409")
    void createReservation_limitExceeded_returns409() throws Exception {
        when(exchangeService.createReservation(any(), eq(VARIANT_ID)))
                .thenThrow(new com.nuverse_laguna.modules.bulldog_exchange.domain.ReservationLimitExceededException());

        mockMvc.perform(post("/api/bulldog-exchange/variants/" + VARIANT_ID + "/reserve")
                        .with(asUser(studentAuth())))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false));
    }

    // ─── GET /api/bulldog-exchange/my-reservations ────────────────────────────

    @Test
    @DisplayName("GET /my-reservations: returns 200 with paginated reservations")
    void getMyReservations_returnsOk() throws Exception {
        Page<ReservationResponse> page = new PageImpl<>(
                List.of(sampleReservation()), PageRequest.of(0, 12), 1);
        when(exchangeService.getMyReservations(any(), any())).thenReturn(page);

        mockMvc.perform(get("/api/bulldog-exchange/my-reservations")
                        .with(asUser(studentAuth())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[0].status").value("PENDING"));
    }

    // ─── PATCH /api/bulldog-exchange/reservations/{id}/cancel ────────────────

    @Test
    @DisplayName("PATCH /reservations/{id}/cancel: owner cancels reservation — returns 200")
    void cancelReservation_owner_returnsOk() throws Exception {
        ReservationResponse cancelled = new ReservationResponse(
                RESERVATION_ID, VARIANT_ID, PRODUCT_ID, "NU Shirt",
                "M", "Blue", "SKU-001", BigDecimal.valueOf(299),
                "CANCELLED", LocalDateTime.now().plusHours(48), LocalDateTime.now());
        when(exchangeService.cancelReservation(any(), eq(RESERVATION_ID))).thenReturn(cancelled);

        mockMvc.perform(patch("/api/bulldog-exchange/reservations/" + RESERVATION_ID + "/cancel")
                        .with(asUser(studentAuth())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("CANCELLED"));
    }

    @Test
    @DisplayName("PATCH /reservations/{id}/cancel: non-owner returns 403")
    void cancelReservation_nonOwner_returns403() throws Exception {
        when(exchangeService.cancelReservation(any(), eq(RESERVATION_ID)))
                .thenThrow(new AppException(HttpStatus.FORBIDDEN, "You do not own this reservation"));

        mockMvc.perform(patch("/api/bulldog-exchange/reservations/" + RESERVATION_ID + "/cancel")
                        .with(asUser(studentAuth())))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("PATCH /reservations/{id}/cancel: already cancelled returns 400")
    void cancelReservation_alreadyCancelled_returns400() throws Exception {
        when(exchangeService.cancelReservation(any(), eq(RESERVATION_ID)))
                .thenThrow(new AppException(HttpStatus.BAD_REQUEST, "Only pending reservations can be cancelled"));

        mockMvc.perform(patch("/api/bulldog-exchange/reservations/" + RESERVATION_ID + "/cancel")
                        .with(asUser(studentAuth())))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
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

    private ProductCardResponse sampleCard() {
        return new ProductCardResponse(
                PRODUCT_ID, "NU Shirt", "CLOTHING", null, 2, BigDecimal.valueOf(299), true);
    }

    private ProductResponse sampleDetail() {
        return new ProductResponse(
                PRODUCT_ID, "NU Shirt", "Official NU shirt", "CLOTHING", null, true,
                List.of(), LocalDateTime.now(), LocalDateTime.now());
    }

    private ReservationResponse sampleReservation() {
        return new ReservationResponse(
                RESERVATION_ID, VARIANT_ID, PRODUCT_ID, "NU Shirt",
                "M", "Blue", "SKU-001", BigDecimal.valueOf(299),
                "PENDING", LocalDateTime.now().plusHours(48), LocalDateTime.now());
    }
}
