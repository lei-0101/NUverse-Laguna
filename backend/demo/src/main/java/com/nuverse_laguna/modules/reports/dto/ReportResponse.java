package com.nuverse_laguna.modules.reports.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record ReportResponse(
        UUID id,
        UUID reporterId,
        String reporterName,
        String subject,
        String category,
        String description,
        String targetType,
        UUID targetId,
        String status,
        LocalDateTime createdAt
) {}
