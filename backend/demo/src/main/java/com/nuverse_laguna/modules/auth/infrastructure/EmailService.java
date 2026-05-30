package com.nuverse_laguna.modules.auth.infrastructure;

public interface EmailService {
    void sendVerificationEmail(String to, String verificationLink);
}
