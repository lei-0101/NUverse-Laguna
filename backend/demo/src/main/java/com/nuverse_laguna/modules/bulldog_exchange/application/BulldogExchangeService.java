package com.nuverse_laguna.modules.bulldog_exchange.application;

import com.nuverse_laguna.modules.bulldog_exchange.domain.MerchandiseCategory;
import com.nuverse_laguna.modules.bulldog_exchange.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

public interface BulldogExchangeService {

    // ── Images ────────────────────────────────────────────────────────────────
    UploadImageResponse uploadImage(MultipartFile file);

    // ── Products ──────────────────────────────────────────────────────────────
    Page<ProductCardResponse> getProducts(MerchandiseCategory category, Pageable pageable);
    ProductResponse getProduct(UUID productId);
    ProductResponse createProduct(CreateProductRequest request);
    ProductResponse updateProduct(UUID productId, UpdateProductRequest request);
    void deactivateProduct(UUID productId);

    // ── Variants ──────────────────────────────────────────────────────────────
    ProductResponse addVariant(UUID productId, AddVariantRequest request);
    VariantResponse updateVariantStock(UUID variantId, UpdateStockRequest request);

    // ── Reservations ──────────────────────────────────────────────────────────
    ReservationResponse createReservation(UUID studentId, UUID variantId);
    Page<ReservationResponse> getMyReservations(UUID studentId, Pageable pageable);
    ReservationResponse cancelReservation(UUID studentId, UUID reservationId);
}
