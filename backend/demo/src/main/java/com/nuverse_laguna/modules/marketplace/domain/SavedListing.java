package com.nuverse_laguna.modules.marketplace.domain;

import com.nuverse_laguna.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(
        name = "saved_listings",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_saved_listings_user_listing",
                columnNames = {"user_id", "listing_id"}
        )
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SavedListing extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "listing_id", nullable = false)
    private UUID listingId;

    public static SavedListing create(UUID userId, UUID listingId) {
        SavedListing saved = new SavedListing();
        saved.userId = userId;
        saved.listingId = listingId;
        return saved;
    }
}
