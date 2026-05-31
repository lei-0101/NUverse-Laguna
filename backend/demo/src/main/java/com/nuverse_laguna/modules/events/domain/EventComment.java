package com.nuverse_laguna.modules.events.domain;

import com.nuverse_laguna.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "event_comments")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class EventComment extends BaseEntity {

    @Column(name = "event_id", nullable = false)
    private UUID eventId;

    @Column(name = "author_id", nullable = false)
    private UUID authorId;

    @Column(name = "author_name", nullable = false, length = 255)
    private String authorName;

    @Column(name = "body", nullable = false, columnDefinition = "TEXT")
    private String body;

    public static EventComment create(UUID eventId, UUID authorId, String authorName, String body) {
        EventComment c = new EventComment();
        c.eventId = eventId;
        c.authorId = authorId;
        c.authorName = authorName;
        c.body = body;
        return c;
    }
}
