package com.nuverse_laguna.modules.marketplace.dto;

import com.nuverse_laguna.shared.profile.ProfileSummary;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record ListingResponse(
        UUID id,
        String title,
        String description,
        BigDecimal price,
        String category,
        String condition,
        String status,
        List<String> imageUrls,
        ProfileSummary seller,
        boolean isSaved,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
