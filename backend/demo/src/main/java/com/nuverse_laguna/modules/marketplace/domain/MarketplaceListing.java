package com.nuverse_laguna.modules.marketplace.domain;

import com.nuverse_laguna.shared.entity.BaseEntity;
import com.nuverse_laguna.shared.exception.AppException;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "marketplace_listings")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MarketplaceListing extends BaseEntity {

    @Column(name = "seller_id", nullable = false)
    private UUID sellerId;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "description", nullable = false, length = 5000)
    private String description;

    @Column(name = "price", nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false, length = 50)
    private ListingCategory category;

    @Enumerated(EnumType.STRING)
    @Column(name = "condition", nullable = false, length = 20)
    private ListingCondition condition;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private ListingStatus status;

    @OneToMany(mappedBy = "listing", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("displayOrder ASC")
    private List<ListingImage> images = new ArrayList<>();

    public static MarketplaceListing create(UUID sellerId, String title, String description,
                                             BigDecimal price, ListingCategory category,
                                             ListingCondition condition) {
        MarketplaceListing listing = new MarketplaceListing();
        listing.sellerId = sellerId;
        listing.title = title;
        listing.description = description;
        listing.price = price;
        listing.category = category;
        listing.condition = condition;
        listing.status = ListingStatus.AVAILABLE;
        return listing;
    }

    public void addImage(String imageUrl, int displayOrder) {
        if (this.images.size() >= 10) {
            throw new AppException(HttpStatus.BAD_REQUEST, "A listing can have at most 10 images");
        }
        this.images.add(ListingImage.create(this, imageUrl, displayOrder));
    }

    public void replaceImages(List<String> imageUrls) {
        if (imageUrls.size() > 10) {
            throw new AppException(HttpStatus.BAD_REQUEST, "A listing can have at most 10 images");
        }
        this.images.clear();
        for (int i = 0; i < imageUrls.size(); i++) {
            this.images.add(ListingImage.create(this, imageUrls.get(i), i));
        }
    }

    public void updateDetails(String title, String description, BigDecimal price,
                               ListingCategory category, ListingCondition condition) {
        if (!isEditable()) {
            throw new AppException(HttpStatus.BAD_REQUEST,
                    "Listing cannot be edited because it is " + this.status.name().toLowerCase());
        }
        this.title = title;
        this.description = description;
        this.price = price;
        this.category = category;
        this.condition = condition;
    }

    public void markAsSold() {
        if (this.status != ListingStatus.AVAILABLE) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Only available listings can be marked as sold");
        }
        this.status = ListingStatus.SOLD;
    }

    public void remove() {
        this.status = ListingStatus.REMOVED;
    }

    public void suspend() {
        this.status = ListingStatus.SUSPENDED;
    }

    public boolean isOwnedBy(UUID userId) {
        return this.sellerId.equals(userId);
    }

    public boolean isEditable() {
        return this.status == ListingStatus.AVAILABLE;
    }
}
