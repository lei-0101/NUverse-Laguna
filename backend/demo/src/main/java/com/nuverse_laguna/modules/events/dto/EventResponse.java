package com.nuverse_laguna.modules.events.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record EventResponse(
        UUID id,
        UUID creatorId,
        String title,
        String description,
        String category,
        String location,
        LocalDateTime startTime,
        LocalDateTime endTime,
        String coverImageUrl,
        Integer capacity,
        String status,
        long rsvpCount,
        boolean rsvpOpen,
        boolean isRsvpd,
        LocalDateTime createdAt,
        long reactionCount,
        String userReaction,
        long commentCount
) {}
