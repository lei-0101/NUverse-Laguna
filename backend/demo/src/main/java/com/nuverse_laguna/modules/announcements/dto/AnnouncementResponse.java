package com.nuverse_laguna.modules.announcements.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record AnnouncementResponse(
        UUID id,
        String title,
        String body,
        String priority,
        UUID createdBy,
        boolean active,
        LocalDateTime expiresAt,
        LocalDateTime createdAt
) {}
