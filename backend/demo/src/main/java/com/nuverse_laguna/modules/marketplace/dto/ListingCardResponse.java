package com.nuverse_laguna.modules.marketplace.dto;

import com.nuverse_laguna.shared.profile.ProfileSummary;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record ListingCardResponse(
        UUID id,
        String title,
        BigDecimal price,
        String category,
        String condition,
        String status,
        String thumbnailUrl,
        ProfileSummary seller,
        LocalDateTime createdAt
) {}
