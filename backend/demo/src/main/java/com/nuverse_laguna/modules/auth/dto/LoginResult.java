package com.nuverse_laguna.modules.auth.dto;

// Internal transfer object — token is placed in HTTP-only cookie by the controller, not exposed in response body
public record LoginResult(
        String token,
        UserResponse user
) {}
