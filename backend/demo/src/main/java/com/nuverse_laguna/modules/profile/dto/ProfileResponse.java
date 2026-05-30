package com.nuverse_laguna.modules.profile.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record ProfileResponse(
        UUID id,
        UUID userId,
        String fullName,
        String avatarUrl,
        String bio,
        String course,
        String yearLevel,
        String interests,
        String visibility,
        boolean hideMarketplaceActivity,
        boolean hideChibiShowcase,
        long followerCount,
        long followingCount,
        LocalDateTime createdAt
) {}
