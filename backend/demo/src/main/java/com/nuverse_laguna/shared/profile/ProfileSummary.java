package com.nuverse_laguna.shared.profile;

import java.util.UUID;

// Shared read-only projection used by modules that need basic user identity (name, avatar)
// without coupling to the profile module's internal entities.
public record ProfileSummary(
        UUID userId,
        String fullName,
        String avatarUrl
) {}
