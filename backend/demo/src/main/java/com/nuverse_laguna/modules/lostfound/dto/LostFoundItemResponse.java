package com.nuverse_laguna.modules.lostfound.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record LostFoundItemResponse(
        UUID id,
        UUID reporterId,
        String reporterName,
        String type,
        String status,
        String title,
        String description,
        String location,
        LocalDate itemDate,
        String imageUrl,
        String contact,
        LocalDateTime createdAt,
        long reactionCount,
        String userReaction,
        int commentCount
) {}
