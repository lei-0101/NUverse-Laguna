package com.nuverse_laguna.modules.marketplace.controller;

import com.nuverse_laguna.modules.marketplace.application.MarketplaceService;
import com.nuverse_laguna.modules.marketplace.domain.ListingCategory;
import com.nuverse_laguna.modules.marketplace.domain.ListingCondition;
import com.nuverse_laguna.modules.marketplace.dto.CreateListingRequest;
import com.nuverse_laguna.modules.marketplace.dto.ListingCardResponse;
import com.nuverse_laguna.modules.marketplace.dto.ListingResponse;
import com.nuverse_laguna.modules.marketplace.dto.MessageSellerRequest;
import com.nuverse_laguna.modules.marketplace.dto.ReportListingRequest;
import com.nuverse_laguna.modules.marketplace.dto.UpdateListingRequest;
import com.nuverse_laguna.modules.marketplace.dto.UploadImageResponse;
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

import java.math.BigDecimal;
import java.util.UUID;

@RestController
@RequestMapping("/api/marketplace")
@RequiredArgsConstructor
public class MarketplaceController {

    private final MarketplaceService marketplaceService;

    // ── Public listing browsing ───────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ListingCardResponse>>> getListings(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) ListingCategory category,
            @RequestParam(required = false) ListingCondition condition,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(ApiResponse.ok("Listings retrieved",
                marketplaceService.getListings(keyword, category, condition, minPrice, maxPrice, pageable)));
    }

    @GetMapping("/{listingId}")
    public ResponseEntity<ApiResponse<ListingResponse>> getListing(
            Authentication auth,
            @PathVariable UUID listingId
    ) {
        return ResponseEntity.ok(ApiResponse.ok("Listing retrieved",
                marketplaceService.getListing(listingId, resolveUserId(auth))));
    }

    // ── Seller operations ─────────────────────────────────────────────────────

    @PostMapping(value = "/images", consumes = "multipart/form-data")
    public ResponseEntity<ApiResponse<UploadImageResponse>> uploadImage(
            @RequestParam("file") MultipartFile file
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Image uploaded", marketplaceService.uploadImage(file)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ListingResponse>> createListing(
            Authentication auth,
            @Valid @RequestBody CreateListingRequest request
    ) {
        ListingResponse created = marketplaceService.createListing(resolveUserId(auth), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Listing created successfully", created));
    }

    @PutMapping("/{listingId}")
    public ResponseEntity<ApiResponse<ListingResponse>> updateListing(
            Authentication auth,
            @PathVariable UUID listingId,
            @Valid @RequestBody UpdateListingRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok("Listing updated",
                marketplaceService.updateListing(resolveUserId(auth), listingId, request)));
    }

    @PatchMapping("/{listingId}/sold")
    public ResponseEntity<ApiResponse<ListingResponse>> markAsSold(
            Authentication auth,
            @PathVariable UUID listingId
    ) {
        return ResponseEntity.ok(ApiResponse.ok("Listing marked as sold",
                marketplaceService.markAsSold(resolveUserId(auth), listingId)));
    }

    @DeleteMapping("/{listingId}")
    public ResponseEntity<ApiResponse<Void>> removeListing(
            Authentication auth,
            @PathVariable UUID listingId
    ) {
        marketplaceService.removeListing(resolveUserId(auth), listingId);
        return ResponseEntity.ok(ApiResponse.ok("Listing removed"));
    }

    // ── Buyer operations ──────────────────────────────────────────────────────

    @PostMapping("/{listingId}/save")
    public ResponseEntity<ApiResponse<Void>> saveListing(
            Authentication auth,
            @PathVariable UUID listingId
    ) {
        marketplaceService.saveListing(resolveUserId(auth), listingId);
        return ResponseEntity.ok(ApiResponse.ok("Listing saved"));
    }

    @DeleteMapping("/{listingId}/save")
    public ResponseEntity<ApiResponse<Void>> unsaveListing(
            Authentication auth,
            @PathVariable UUID listingId
    ) {
        marketplaceService.unsaveListing(resolveUserId(auth), listingId);
        return ResponseEntity.ok(ApiResponse.ok("Listing removed from saved"));
    }

    @PostMapping("/{listingId}/message")
    public ResponseEntity<ApiResponse<Void>> messageSeller(
            Authentication auth,
            @PathVariable UUID listingId,
            @Valid @RequestBody MessageSellerRequest request
    ) {
        marketplaceService.messageSeller(resolveUserId(auth), listingId, request.message());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Message sent to seller."));
    }

    @PostMapping("/{listingId}/report")
    public ResponseEntity<ApiResponse<Void>> reportListing(
            Authentication auth,
            @PathVariable UUID listingId,
            @Valid @RequestBody ReportListingRequest request
    ) {
        marketplaceService.reportListing(resolveUserId(auth), listingId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Listing reported. Our team will review it shortly."));
    }

    // ── User-scoped views ─────────────────────────────────────────────────────

    @GetMapping("/my-listings")
    public ResponseEntity<ApiResponse<Page<ListingCardResponse>>> getMyListings(
            Authentication auth,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(ApiResponse.ok("Your listings retrieved",
                marketplaceService.getMyListings(resolveUserId(auth), pageable)));
    }

    @GetMapping("/saved")
    public ResponseEntity<ApiResponse<Page<ListingCardResponse>>> getSavedListings(
            Authentication auth,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(ApiResponse.ok("Saved listings retrieved",
                marketplaceService.getSavedListings(resolveUserId(auth), pageable)));
    }

    // ── Admin operations ──────────────────────────────────────────────────────

    @PatchMapping("/{listingId}/suspend")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ListingResponse>> suspendListing(
            @PathVariable UUID listingId
    ) {
        return ResponseEntity.ok(ApiResponse.ok("Listing suspended",
                marketplaceService.suspendListing(listingId)));
    }

    // ── Utility ───────────────────────────────────────────────────────────────

    private UUID resolveUserId(Authentication auth) {
        return UUID.fromString((String) auth.getPrincipal());
    }
}
