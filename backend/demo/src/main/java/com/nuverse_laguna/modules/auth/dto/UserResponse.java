package com.nuverse_laguna.modules.auth.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record UserResponse(
        UUID id,
        String email,
        String fullName,
        String role,
        String status,
        LocalDateTime suspendedUntil,
        int suspendCount,
        String suspensionReason
) {}
