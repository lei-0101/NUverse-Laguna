package com.nuverse_laguna.modules.bulldog_exchange.controller;

import com.nuverse_laguna.modules.bulldog_exchange.application.BulldogExchangeService;
import com.nuverse_laguna.modules.bulldog_exchange.domain.MerchandiseCategory;
import com.nuverse_laguna.modules.bulldog_exchange.dto.*;
import com.nuverse_laguna.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/api/bulldog-exchange")
@RequiredArgsConstructor
public class BulldogExchangeController {

    private final BulldogExchangeService exchangeService;

    // ── Admin: image upload ────────────────────────────────────────────────────

    @PostMapping(value = "/images", consumes = "multipart/form-data")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UploadImageResponse>> uploadImage(
            @RequestParam("file") MultipartFile file
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Image uploaded", exchangeService.uploadImage(file)));
    }

    // ── Public product browsing ────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ProductCardResponse>>> getProducts(
            @RequestParam(required = false) MerchandiseCategory category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "name"));
        return ResponseEntity.ok(ApiResponse.ok("Products retrieved",
                exchangeService.getProducts(category, pageable)));
    }

    @GetMapping("/{productId}")
    public ResponseEntity<ApiResponse<ProductResponse>> getProduct(
            @PathVariable UUID productId
    ) {
        return ResponseEntity.ok(ApiResponse.ok("Product retrieved",
                exchangeService.getProduct(productId)));
    }

    // ── Admin: product management ──────────────────────────────────────────────

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(
            @Valid @RequestBody CreateProductRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Product created", exchangeService.createProduct(request)));
    }

    @PutMapping("/{productId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ProductResponse>> updateProduct(
            @PathVariable UUID productId,
            @Valid @RequestBody UpdateProductRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok("Product updated",
                exchangeService.updateProduct(productId, request)));
    }

    @DeleteMapping("/{productId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deactivateProduct(
            @PathVariable UUID productId
    ) {
        exchangeService.deactivateProduct(productId);
        return ResponseEntity.ok(ApiResponse.ok("Product deactivated"));
    }

    // ── Admin: variant management ──────────────────────────────────────────────

    @PostMapping("/{productId}/variants")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ProductResponse>> addVariant(
            @PathVariable UUID productId,
            @Valid @RequestBody AddVariantRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Variant added", exchangeService.addVariant(productId, request)));
    }

    @PatchMapping("/variants/{variantId}/stock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<VariantResponse>> updateVariantStock(
            @PathVariable UUID variantId,
            @Valid @RequestBody UpdateStockRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok("Stock updated",
                exchangeService.updateVariantStock(variantId, request)));
    }

    // ── Student: reservation management ───────────────────────────────────────

    @PostMapping("/variants/{variantId}/reserve")
    public ResponseEntity<ApiResponse<ReservationResponse>> createReservation(
            Authentication auth,
            @PathVariable UUID variantId
    ) {
        ReservationResponse response = exchangeService.createReservation(resolveUserId(auth), variantId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Reservation created. Pick up within 48 hours.", response));
    }

    @GetMapping("/my-reservations")
    public ResponseEntity<ApiResponse<Page<ReservationResponse>>> getMyReservations(
            Authentication auth,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        PageRequest pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(ApiResponse.ok("Reservations retrieved",
                exchangeService.getMyReservations(resolveUserId(auth), pageable)));
    }

    @PatchMapping("/reservations/{reservationId}/cancel")
    public ResponseEntity<ApiResponse<ReservationResponse>> cancelReservation(
            Authentication auth,
            @PathVariable UUID reservationId
    ) {
        return ResponseEntity.ok(ApiResponse.ok("Reservation cancelled",
                exchangeService.cancelReservation(resolveUserId(auth), reservationId)));
    }

    // ── Utility ───────────────────────────────────────────────────────────────

    private UUID resolveUserId(Authentication auth) {
        return UUID.fromString((String) auth.getPrincipal());
    }
}
