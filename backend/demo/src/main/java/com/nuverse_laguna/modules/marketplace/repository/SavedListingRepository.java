package com.nuverse_laguna.modules.marketplace.repository;

import com.nuverse_laguna.modules.marketplace.domain.SavedListing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface SavedListingRepository extends JpaRepository<SavedListing, UUID> {

    boolean existsByUserIdAndListingId(UUID userId, UUID listingId);

    @Modifying
    @Query("DELETE FROM SavedListing sl WHERE sl.userId = :userId AND sl.listingId = :listingId")
    void deleteByUserIdAndListingId(@Param("userId") UUID userId, @Param("listingId") UUID listingId);
}
