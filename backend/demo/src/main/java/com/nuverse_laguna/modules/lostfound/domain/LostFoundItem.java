package com.nuverse_laguna.modules.lostfound.domain;

import com.nuverse_laguna.shared.entity.BaseEntity;
import com.nuverse_laguna.shared.exception.AppException;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "lost_found_items")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class LostFoundItem extends BaseEntity {

    @Column(name = "reporter_id", nullable = false)
    private UUID reporterId;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 10)
    private ItemType type;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 15)
    private ItemStatus status;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "location", nullable = false, length = 300)
    private String location;

    @Column(name = "item_date", nullable = false)
    private LocalDate itemDate;

    @Column(name = "image_url", length = 512)
    private String imageUrl;

    @Column(name = "contact", nullable = false, length = 200)
    private String contact;

    public static LostFoundItem create(UUID reporterId, ItemType type, String title,
                                        String description, String location, LocalDate itemDate,
                                        String imageUrl, String contact) {
        LostFoundItem item = new LostFoundItem();
        item.reporterId = reporterId;
        item.type = type;
        item.title = title;
        item.description = description;
        item.location = location;
        item.itemDate = itemDate;
        item.imageUrl = imageUrl;
        item.contact = contact;
        item.status = ItemStatus.OPEN;
        return item;
    }

    public void update(ItemType type, String title, String description, String location,
                       java.time.LocalDate itemDate, String imageUrl, String contact) {
        this.type = type;
        this.title = title;
        this.description = description;
        this.location = location;
        this.itemDate = itemDate;
        this.imageUrl = imageUrl;
        this.contact = contact;
    }

    public void resolve() {
        if (this.status == ItemStatus.RESOLVED) {
            throw new AppException(HttpStatus.CONFLICT, "Item is already resolved");
        }
        this.status = ItemStatus.RESOLVED;
    }

    public boolean isOwnedBy(UUID userId) {
        return this.reporterId.equals(userId);
    }
}
