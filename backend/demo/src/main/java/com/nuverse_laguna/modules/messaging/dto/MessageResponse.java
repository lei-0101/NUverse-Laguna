package com.nuverse_laguna.modules.messaging.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record MessageResponse(
        UUID id,
        UUID conversationId,
        UUID senderId,
        String senderName,
        String body,
        boolean read,
        LocalDateTime createdAt
) {}
