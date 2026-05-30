package com.nuverse_laguna.modules.events.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record RsvpResponse(
        UUID rsvpId,
        UUID eventId,
        String eventTitle,
        String eventLocation,
        LocalDateTime eventStartTime,
        String eventStatus,
        String rsvpStatus,
        LocalDateTime rsvpdAt
) {}
