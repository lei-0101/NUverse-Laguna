package com.nuverse_laguna.modules.auth.dto;

import java.time.LocalDateTime;

public record SuspensionResponse(
        LocalDateTime suspendedUntil,
        String reason,
        int suspendCount
) {}
