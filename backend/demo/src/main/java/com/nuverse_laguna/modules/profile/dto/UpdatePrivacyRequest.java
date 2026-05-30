package com.nuverse_laguna.modules.profile.dto;

import jakarta.validation.constraints.NotNull;

public record UpdatePrivacyRequest(

        @NotNull(message = "hideMarketplaceActivity is required")
        Boolean hideMarketplaceActivity,

        @NotNull(message = "hideChibiShowcase is required")
        Boolean hideChibiShowcase
) {}
