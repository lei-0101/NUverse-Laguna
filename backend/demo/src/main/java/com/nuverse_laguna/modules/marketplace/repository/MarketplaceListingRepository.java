package com.nuverse_laguna.modules.marketplace.repository;

import com.nuverse_laguna.modules.marketplace.domain.MarketplaceListing;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MarketplaceListingRepository extends
        JpaRepository<MarketplaceListing, UUID>,
        JpaSpecificationExecutor<MarketplaceListing> {

    Page<MarketplaceListing> findBySellerId(UUID sellerId, Pageable pageable);

    // Loads images in the same query to avoid N+1 on listing detail page
    @Query("SELECT ml FROM MarketplaceListing ml LEFT JOIN FETCH ml.images WHERE ml.id = :id")
    Optional<MarketplaceListing> findByIdWithImages(@Param("id") UUID id);

    @Query("SELECT ml FROM MarketplaceListing ml WHERE ml.id IN " +
           "(SELECT sl.listingId FROM SavedListing sl WHERE sl.userId = :userId)")
    Page<MarketplaceListing> findSavedListings(@Param("userId") UUID userId, Pageable pageable);

    // Batch-loads the primary (first) image per listing so card grids show a
    // thumbnail without triggering an N+1 over the lazy images collection.
    @Query("SELECT img.listing.id AS listingId, img.imageUrl AS imageUrl " +
           "FROM ListingImage img WHERE img.displayOrder = 0 AND img.listing.id IN :listingIds")
    List<ListingThumbnailProjection> findPrimaryImages(@Param("listingIds") List<UUID> listingIds);

    interface ListingThumbnailProjection {
        UUID getListingId();
        String getImageUrl();
    }
}
