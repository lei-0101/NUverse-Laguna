package com.nuverse_laguna.modules.notifications.domain;

import com.nuverse_laguna.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "notifications")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Notification extends BaseEntity {

    @Column(name = "recipient_id", nullable = false, updatable = false)
    private UUID recipientId;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 50, updatable = false)
    private NotificationType type;

    @Column(name = "title", nullable = false, length = 200, updatable = false)
    private String title;

    @Column(name = "body", nullable = false, length = 500, updatable = false)
    private String body;

    @Column(name = "reference_id", updatable = false)
    private UUID referenceId;

    @Enumerated(EnumType.STRING)
    @Column(name = "reference_type", length = 50, updatable = false)
    private ReferenceType referenceType;

    @Column(name = "is_read", nullable = false)
    private boolean read;

    public static Notification create(UUID recipientId, NotificationType type,
                                      String title, String body,
                                      UUID referenceId, ReferenceType referenceType) {
        Notification n = new Notification();
        n.recipientId = recipientId;
        n.type = type;
        n.title = title;
        n.body = body;
        n.referenceId = referenceId;
        n.referenceType = referenceType;
        n.read = false;
        return n;
    }

    /** Marks this notification as read. Idempotent — calling it twice is harmless. */
    public void markAsRead() {
        this.read = true;
    }
}
