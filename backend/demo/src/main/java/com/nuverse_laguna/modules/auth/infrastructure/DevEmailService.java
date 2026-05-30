package com.nuverse_laguna.modules.auth.infrastructure;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

// Replace with SmtpEmailService in production; configure via spring.mail.* properties
@Component
@Slf4j
public class DevEmailService implements EmailService {

    @Override
    public void sendVerificationEmail(String to, String verificationLink) {
        log.info("========== VERIFICATION EMAIL ==========");
        log.info("To:   {}", to);
        log.info("Link: {}", verificationLink);
        log.info("========================================");
    }
}
