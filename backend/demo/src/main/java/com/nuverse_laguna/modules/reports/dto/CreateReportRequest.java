package com.nuverse_laguna.modules.reports.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record CreateReportRequest(
        @NotBlank @Size(max = 200) String subject,
        @NotBlank String category,
        @NotBlank @Size(max = 5000) String description,
        String targetType,
        UUID targetId
) {}
