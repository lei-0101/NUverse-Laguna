package com.nuverse_laguna.modules.marketplace.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ReportListingRequest(

        @NotBlank(message = "Report reason is required")
        @Size(max = 500, message = "Reason must be 500 characters or less")
        String reason
) {}
