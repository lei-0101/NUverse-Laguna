package com.nuverse_laguna.modules.events.domain;

import com.nuverse_laguna.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "event_reactions",
        uniqueConstraints = @UniqueConstraint(columnNames = {"event_id", "user_id"}))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class EventReaction extends BaseEntity {

    @Column(name = "event_id", nullable = false)
    private UUID eventId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "emoji", nullable = false, length = 10)
    private String emoji;

    public static EventReaction create(UUID eventId, UUID userId, String emoji) {
        EventReaction r = new EventReaction();
        r.eventId = eventId;
        r.userId = userId;
        r.emoji = emoji != null ? emoji : "👍";
        return r;
    }

    public void updateEmoji(String emoji) { this.emoji = emoji; }
}
