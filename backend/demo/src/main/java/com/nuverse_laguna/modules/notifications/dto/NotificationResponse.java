package com.nuverse_laguna.modules.notifications.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record NotificationResponse(
        UUID id,
        String type,
        String title,
        String body,
        UUID referenceId,
        String referenceType,
        boolean read,
        LocalDateTime createdAt
) {}
