package com.nuverse_laguna.modules.events.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record EventCardResponse(
        UUID id,
        String title,
        String category,
        String location,
        LocalDateTime startTime,
        LocalDateTime endTime,
        String status,
        String coverImageUrl,
        long rsvpCount,
        Integer capacity
) {}
