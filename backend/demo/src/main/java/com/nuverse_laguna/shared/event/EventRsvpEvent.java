package com.nuverse_laguna.shared.event;

import org.springframework.context.ApplicationEvent;

import java.time.LocalDateTime;
import java.util.UUID;

public class EventRsvpEvent extends ApplicationEvent {

    private final UUID eventId;
    private final UUID userId;
    private final String eventTitle;
    private final LocalDateTime eventStartTime;

    public EventRsvpEvent(Object source, UUID eventId, UUID userId,
                          String eventTitle, LocalDateTime eventStartTime) {
        super(source);
        this.eventId = eventId;
        this.userId = userId;
        this.eventTitle = eventTitle;
        this.eventStartTime = eventStartTime;
    }

    public UUID getEventId()            { return eventId; }
    public UUID getUserId()             { return userId; }
    public String getEventTitle()       { return eventTitle; }
    public LocalDateTime getEventStartTime() { return eventStartTime; }
}
