package com.nuverse_laguna.modules.events.domain;

import com.nuverse_laguna.shared.entity.BaseEntity;
import com.nuverse_laguna.shared.exception.AppException;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "campus_events")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CampusEvent extends BaseEntity {

    @Column(name = "creator_id", updatable = false)
    private UUID creatorId;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false, length = 50)
    private EventCategory category;

    @Column(name = "location", nullable = false, length = 300)
    private String location;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    @Column(name = "cover_image_url", length = 500)
    private String coverImageUrl;

    @Column(name = "capacity")
    private Integer capacity;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private EventStatus status;

    public static CampusEvent create(UUID creatorId, String title, String description,
                                     EventCategory category, String location,
                                     LocalDateTime startTime, LocalDateTime endTime,
                                     String coverImageUrl, Integer capacity) {
        CampusEvent event = new CampusEvent();
        event.creatorId = creatorId;
        event.title = title;
        event.description = description;
        event.category = category;
        event.location = location;
        event.startTime = startTime;
        event.endTime = endTime;
        event.coverImageUrl = coverImageUrl;
        event.capacity = capacity;
        event.status = EventStatus.DRAFT;
        return event;
    }

    public void updateDetails(String title, String description, EventCategory category,
                              String location, LocalDateTime startTime, LocalDateTime endTime,
                              String coverImageUrl, Integer capacity) {
        if (this.status == EventStatus.CANCELLED) {
            throw new AppException(HttpStatus.CONFLICT, "Cannot edit a cancelled event");
        }
        this.title = title;
        this.description = description;
        this.category = category;
        this.location = location;
        this.startTime = startTime;
        this.endTime = endTime;
        this.coverImageUrl = coverImageUrl;
        this.capacity = capacity;
    }

    public void publish() {
        if (this.status != EventStatus.DRAFT) {
            throw new AppException(HttpStatus.CONFLICT, "Only draft events can be published");
        }
        this.status = EventStatus.PUBLISHED;
    }

    public void cancel() {
        if (this.status == EventStatus.CANCELLED) {
            throw new AppException(HttpStatus.CONFLICT, "Event is already cancelled");
        }
        this.status = EventStatus.CANCELLED;
    }

    public void archive() {
        this.status = EventStatus.ARCHIVED;
    }

    /** True if new RSVPs are currently accepted for this event. */
    public boolean isRsvpOpen() {
        return this.status == EventStatus.PUBLISHED
                && this.startTime.isAfter(LocalDateTime.now());
    }

    public boolean isCreatedBy(UUID userId) {
        return userId.equals(this.creatorId);
    }
}
