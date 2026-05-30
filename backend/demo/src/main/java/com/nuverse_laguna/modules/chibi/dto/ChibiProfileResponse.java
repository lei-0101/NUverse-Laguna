package com.nuverse_laguna.modules.chibi.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record ChibiProfileResponse(
        UUID userId,
        int xp,
        int level,
        String title,
        int xpToNextLevel,
        int xpForCurrentLevel,
        int xpForNextLevel,
        List<String> achievements,
        LocalDateTime createdAt
) {}
