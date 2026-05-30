package com.nuverse_laguna.modules.profile.application;

import com.nuverse_laguna.shared.event.UserRegisteredEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
@Slf4j
public class ProfileEventListener {

    private final ProfileService profileService;

    // Fires after the registration transaction commits so the user row is guaranteed
    // to exist when the profile is created (respects the FK constraint).
    // REQUIRES_NEW is essential: in the AFTER_COMMIT phase the original transaction is
    // already committed, so without a brand-new transaction the profile INSERT would
    // join a completing transaction and never be committed (silently lost).
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void onUserRegistered(UserRegisteredEvent event) {
        try {
            profileService.createProfile(event.userId(), event.fullName());
        } catch (Exception e) {
            log.error("Failed to create profile for user {}: {}", event.userId(), e.getMessage());
        }
    }
}
