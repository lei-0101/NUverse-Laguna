package com.nuverse_laguna.modules.lostfound.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record LostFoundCommentResponse(
        UUID id,
        UUID authorId,
        String authorName,
        String body,
        LocalDateTime createdAt
) {}
