package com.nuverse_laguna.modules.notifications.application;

import com.nuverse_laguna.modules.notifications.domain.NotificationType;
import com.nuverse_laguna.modules.notifications.domain.ReferenceType;
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

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationEventListener {

    private final NotificationService notificationService;

    // REQUIRES_NEW: the source transaction has already committed by AFTER_COMMIT.
    // Without a new transaction the notification INSERT would join a completing
    // transaction context and be silently discarded — same invariant as ProfileEventListener.

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void onReservationCreated(ReservationCreatedEvent event) {
        try {
            notificationService.create(
                    event.getStudentId(),
                    NotificationType.RESERVATION_CREATED,
                    "Reservation Confirmed",
                    "Your reservation for \"" + event.getProductName() + "\" is confirmed. Pick it up within 48 hours.",
                    event.getReservationId(),
                    ReferenceType.RESERVATION
            );
        } catch (Exception e) {
            log.error("Failed to create RESERVATION_CREATED notification for student {}: {}",
                    event.getStudentId(), e.getMessage());
        }
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void onEventRsvp(EventRsvpEvent event) {
        try {
            String body = String.format(
                    "You're registered for \"%s\". It starts on %s.",
                    event.getEventTitle(),
                    event.getEventStartTime().toLocalDate());
            notificationService.create(
                    event.getUserId(),
                    NotificationType.EVENT_RSVP,
                    "RSVP Confirmed",
                    body,
                    event.getEventId(),
                    ReferenceType.EVENT
            );
        } catch (Exception e) {
            log.error("Failed to create EVENT_RSVP notification for user {}: {}",
                    event.getUserId(), e.getMessage());
        }
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void onUserFollowed(UserFollowedEvent event) {
        try {
            notificationService.create(
                    event.followedUserId(),
                    NotificationType.NEW_FOLLOWER,
                    "New Follower",
                    event.followerName() + " started following you.",
                    event.followerId(),
                    ReferenceType.USER_PROFILE
            );
        } catch (Exception e) {
            log.error("Failed to create NEW_FOLLOWER notification for user {}: {}",
                    event.followedUserId(), e.getMessage());
        }
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void onUserRegistered(UserRegisteredEvent event) {
        try {
            notificationService.create(
                    event.userId(),
                    NotificationType.WELCOME,
                    "Welcome to NUverse Laguna!",
                    "Hi " + event.fullName() + ", welcome to your NU Laguna campus hub. Explore the Marketplace, Bulldog Exchange, and more.",
                    null,
                    null
            );
        } catch (Exception e) {
            log.error("Failed to create WELCOME notification for user {}: {}",
                    event.userId(), e.getMessage());
        }
    }
}
