package com.nuverse_laguna.modules.events.domain;

import com.nuverse_laguna.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "event_rsvps",
        uniqueConstraints = @UniqueConstraint(columnNames = {"event_id", "user_id"}))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class EventRsvp extends BaseEntity {

    @Column(name = "event_id", nullable = false, updatable = false)
    private UUID eventId;

    @Column(name = "user_id", nullable = false, updatable = false)
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private RsvpStatus status;

    public static EventRsvp create(UUID eventId, UUID userId) {
        EventRsvp rsvp = new EventRsvp();
        rsvp.eventId = eventId;
        rsvp.userId = userId;
        rsvp.status = RsvpStatus.ATTENDING;
        return rsvp;
    }

    public void cancel() {
        this.status = RsvpStatus.CANCELLED;
    }
}
