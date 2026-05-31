package com.nuverse_laguna.modules.marketplace.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record MessageSellerRequest(
        @NotBlank @Size(max = 500) String message
) {}
