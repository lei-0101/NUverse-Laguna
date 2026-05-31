package com.nuverse_laguna.modules.announcements.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public record CreateAnnouncementRequest(
        @NotBlank @Size(max = 200) String title,
        @NotBlank String body,
        @NotNull String priority,
        LocalDateTime expiresAt,
        String imageUrl
) {}
