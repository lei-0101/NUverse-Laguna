package com.nuverse_laguna.modules.marketplace.application;

import com.nuverse_laguna.modules.marketplace.domain.ListingCategory;
import com.nuverse_laguna.modules.marketplace.domain.ListingCondition;
import com.nuverse_laguna.modules.marketplace.dto.CreateListingRequest;
import com.nuverse_laguna.modules.marketplace.dto.ListingCardResponse;
import com.nuverse_laguna.modules.marketplace.dto.ListingResponse;
import com.nuverse_laguna.modules.marketplace.dto.ReportListingRequest;
import com.nuverse_laguna.modules.marketplace.dto.UpdateListingRequest;
import com.nuverse_laguna.modules.marketplace.dto.UploadImageResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.UUID;

public interface MarketplaceService {
    UploadImageResponse uploadImage(MultipartFile file);
    ListingResponse createListing(UUID sellerId, CreateListingRequest request);
    Page<ListingCardResponse> getListings(String keyword, ListingCategory category,
                                          ListingCondition condition, BigDecimal minPrice,
                                          BigDecimal maxPrice, Pageable pageable);
    ListingResponse getListing(UUID listingId, UUID viewerId);
    ListingResponse updateListing(UUID userId, UUID listingId, UpdateListingRequest request);
    ListingResponse markAsSold(UUID userId, UUID listingId);
    void removeListing(UUID userId, UUID listingId);
    void saveListing(UUID userId, UUID listingId);
    void unsaveListing(UUID userId, UUID listingId);
    Page<ListingCardResponse> getSavedListings(UUID userId, Pageable pageable);
    Page<ListingCardResponse> getMyListings(UUID userId, Pageable pageable);
    void reportListing(UUID reporterId, UUID listingId, ReportListingRequest request);
    ListingResponse suspendListing(UUID listingId);
    void messageSeller(UUID buyerId, UUID listingId, String message);
}
