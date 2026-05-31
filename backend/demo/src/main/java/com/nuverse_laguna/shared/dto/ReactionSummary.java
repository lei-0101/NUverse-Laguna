package com.nuverse_laguna.shared.dto;

import java.util.UUID;

public record ReactionSummary(
        UUID userId,
        String fullName,
        String avatarUrl,
        String emoji
) {}
