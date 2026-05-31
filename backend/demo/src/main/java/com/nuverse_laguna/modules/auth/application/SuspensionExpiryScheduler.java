package com.nuverse_laguna.modules.auth.application;

import com.nuverse_laguna.modules.auth.domain.User;
import com.nuverse_laguna.modules.auth.domain.UserStatus;
import com.nuverse_laguna.modules.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class SuspensionExpiryScheduler {

    private final UserRepository userRepository;

    /** Runs every 5 minutes — reactivates users whose suspension period has expired. */
    @Scheduled(fixedDelay = 300_000)
    @Transactional
    public void unsuspendExpiredUsers() {
        List<User> expired = userRepository.findExpiredSuspensions(
                UserStatus.SUSPENDED, LocalDateTime.now()
        );
        if (expired.isEmpty()) return;
        for (User u : expired) {
            u.reactivate();
        }
        userRepository.saveAll(expired);
        log.info("Auto-unsuspended {} user(s) whose suspension expired.", expired.size());
    }
}
