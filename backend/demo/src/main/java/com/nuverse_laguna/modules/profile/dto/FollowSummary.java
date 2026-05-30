package com.nuverse_laguna.modules.profile.dto;

import java.util.UUID;

public record FollowSummary(
        UUID userId,
        String fullName,
        String avatarUrl
) {}
