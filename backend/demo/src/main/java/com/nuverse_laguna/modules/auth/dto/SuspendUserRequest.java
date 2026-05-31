package com.nuverse_laguna.modules.auth.dto;

import java.time.LocalDateTime;

public record SuspendUserRequest(
        LocalDateTime suspendedUntil,
        String reason
) {}
