package com.nuverse_laguna.modules.chibi.application;

import com.nuverse_laguna.modules.chibi.domain.XpSource;
import com.nuverse_laguna.shared.event.EventRsvpEvent;
import com.nuverse_laguna.shared.event.ReservationCreatedEvent;
import com.nuverse_laguna.shared.event.UserFollowedEvent;
import com.nuverse_laguna.shared.event.UserRegisteredEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * Awards XP whenever significant domain events fire.
 * Same AFTER_COMMIT + REQUIRES_NEW pattern as NotificationEventListener.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ChibiXpEventListener {

    private final ChibiService chibiService;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void onUserRegistered(UserRegisteredEvent event) {
        try {
            chibiService.awardXp(event.userId(), XpSource.REGISTRATION,
                    "Welcome to NUverse Laguna!");
        } catch (Exception e) {
            log.error("XP award failed for REGISTRATION user {}: {}", event.userId(), e.getMessage());
        }
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void onEventRsvp(EventRsvpEvent event) {
        try {
            chibiService.awardXp(event.getUserId(), XpSource.RSVP_EVENT,
                    "RSVP'd to \"" + event.getEventTitle() + "\"");
        } catch (Exception e) {
            log.error("XP award failed for RSVP user {}: {}", event.getUserId(), e.getMessage());
        }
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void onReservationCreated(ReservationCreatedEvent event) {
        try {
            chibiService.awardXp(event.getStudentId(), XpSource.MAKE_RESERVATION,
                    "Reserved \"" + event.getProductName() + "\"");
        } catch (Exception e) {
            log.error("XP award failed for RESERVATION user {}: {}", event.getStudentId(), e.getMessage());
        }
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void onUserFollowed(UserFollowedEvent event) {
        try {
            chibiService.awardXp(event.followerId(), XpSource.FOLLOW_USER,
                    "Followed a new user");
        } catch (Exception e) {
            log.error("XP award failed for FOLLOW user {}: {}", event.followerId(), e.getMessage());
        }
    }
}
