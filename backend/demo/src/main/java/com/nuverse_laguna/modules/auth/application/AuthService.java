package com.nuverse_laguna.modules.auth.application;

import com.nuverse_laguna.modules.auth.dto.LoginRequest;
import com.nuverse_laguna.modules.auth.dto.LoginResult;
import com.nuverse_laguna.modules.auth.dto.RegisterRequest;
import com.nuverse_laguna.modules.auth.dto.UserResponse;

import java.util.UUID;

public interface AuthService {
    void register(RegisterRequest request);
    LoginResult login(LoginRequest request);
    void verifyEmail(String token);
    UserResponse getCurrentUser(UUID userId);
}
