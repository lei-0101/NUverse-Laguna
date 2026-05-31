package com.nuverse_laguna.modules.events.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record EventCommentResponse(
        UUID id,
        UUID authorId,
        String authorName,
        String body,
        LocalDateTime createdAt
) {}
