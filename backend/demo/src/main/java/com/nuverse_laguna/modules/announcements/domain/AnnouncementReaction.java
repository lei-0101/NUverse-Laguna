package com.nuverse_laguna.modules.announcements.domain;

import com.nuverse_laguna.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "announcement_reactions",
        uniqueConstraints = @UniqueConstraint(columnNames = {"announcement_id", "user_id"}))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class AnnouncementReaction extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "announcement_id", nullable = false)
    private EmergencyAnnouncement announcement;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "emoji", nullable = false, length = 10)
    private String emoji;

    public static AnnouncementReaction create(EmergencyAnnouncement announcement, UUID userId, String emoji) {
        AnnouncementReaction r = new AnnouncementReaction();
        r.announcement = announcement;
        r.userId = userId;
        r.emoji = emoji != null ? emoji : "👍";
        return r;
    }

    public void updateEmoji(String emoji) {
        this.emoji = emoji;
    }
}
