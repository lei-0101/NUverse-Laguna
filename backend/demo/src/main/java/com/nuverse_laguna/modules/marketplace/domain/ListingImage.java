package com.nuverse_laguna.modules.marketplace.domain;

import com.nuverse_laguna.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "listing_images")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ListingImage extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "listing_id", nullable = false)
    private MarketplaceListing listing;

    @Column(name = "image_url", nullable = false, length = 512)
    private String imageUrl;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;

    static ListingImage create(MarketplaceListing listing, String imageUrl, int displayOrder) {
        ListingImage image = new ListingImage();
        image.listing = listing;
        image.imageUrl = imageUrl;
        image.displayOrder = displayOrder;
        return image;
    }
}
