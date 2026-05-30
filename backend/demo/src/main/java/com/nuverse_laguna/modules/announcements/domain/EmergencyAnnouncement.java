package com.nuverse_laguna.modules.announcements.domain;

import com.nuverse_laguna.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "emergency_announcements")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class EmergencyAnnouncement extends BaseEntity {

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "body", nullable = false, columnDefinition = "TEXT")
    private String body;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false, length = 20)
    private AnnouncementPriority priority;

    @Column(name = "created_by", nullable = false)
    private UUID createdBy;

    @Column(name = "active", nullable = false)
    private boolean active;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    public static EmergencyAnnouncement create(String title, String body,
                                                AnnouncementPriority priority,
                                                UUID createdBy,
                                                LocalDateTime expiresAt) {
        EmergencyAnnouncement a = new EmergencyAnnouncement();
        a.title = title;
        a.body = body;
        a.priority = priority;
        a.createdBy = createdBy;
        a.active = true;
        a.expiresAt = expiresAt;
        return a;
    }

    public void update(String title, String body, AnnouncementPriority priority, LocalDateTime expiresAt) {
        this.title = title;
        this.body = body;
        this.priority = priority;
        this.expiresAt = expiresAt;
    }

    public void deactivate() {
        this.active = false;
    }

    public boolean isExpired() {
        return expiresAt != null && expiresAt.isBefore(LocalDateTime.now());
    }

    public boolean isEffective() {
        return active && !isExpired();
    }
}
