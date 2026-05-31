package com.nuverse_laguna.modules.chibi.application;

import com.nuverse_laguna.modules.chibi.domain.XpSource;
import com.nuverse_laguna.modules.chibi.repository.ChibiXpEventRepository;
import com.nuverse_laguna.shared.event.AvatarUploadedEvent;
import com.nuverse_laguna.shared.event.DailyLoginEvent;
import com.nuverse_laguna.shared.event.EventRsvpEvent;
import com.nuverse_laguna.shared.event.LostFoundItemCreatedEvent;
import com.nuverse_laguna.shared.event.LostFoundItemResolvedEvent;
import com.nuverse_laguna.shared.event.MarketplaceListingCreatedEvent;
import com.nuverse_laguna.shared.event.MarketplaceListingSoldEvent;
import com.nuverse_laguna.shared.event.ProfileCompletedEvent;
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

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Awards XP whenever significant domain events fire.
 * Same AFTER_COMMIT + REQUIRES_NEW pattern as NotificationEventListener.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ChibiXpEventListener {

    private final ChibiService chibiService;
    private final ChibiXpEventRepository xpEventRepository;

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

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void onMarketplaceListingCreated(MarketplaceListingCreatedEvent event) {
        try {
            chibiService.awardXp(event.sellerId(), XpSource.FIRST_LISTING,
                    "Posted listing: \"" + event.title() + "\"");
        } catch (Exception e) {
            log.error("XP award failed for LISTING_CREATED user {}: {}", event.sellerId(), e.getMessage());
        }
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void onMarketplaceListingSold(MarketplaceListingSoldEvent event) {
        try {
            chibiService.awardXp(event.sellerId(), XpSource.LISTING_SOLD,
                    "Sold listing: \"" + event.title() + "\"");
        } catch (Exception e) {
            log.error("XP award failed for LISTING_SOLD user {}: {}", event.sellerId(), e.getMessage());
        }
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void onLostFoundItemCreated(LostFoundItemCreatedEvent event) {
        try {
            chibiService.awardXp(event.reporterId(), XpSource.LOST_FOUND_POST,
                    "Posted lost & found item: \"" + event.title() + "\"");
        } catch (Exception e) {
            log.error("XP award failed for LOST_FOUND_POST user {}: {}", event.reporterId(), e.getMessage());
        }
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void onLostFoundItemResolved(LostFoundItemResolvedEvent event) {
        try {
            chibiService.awardXp(event.reporterId(), XpSource.LOST_FOUND_RESOLVED,
                    "Resolved a lost & found item");
        } catch (Exception e) {
            log.error("XP award failed for LOST_FOUND_RESOLVED user {}: {}", event.reporterId(), e.getMessage());
        }
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void onAvatarUploaded(AvatarUploadedEvent event) {
        try {
            chibiService.awardXp(event.userId(), XpSource.UPLOAD_AVATAR, "Uploaded a profile avatar");
        } catch (Exception e) {
            log.error("XP award failed for UPLOAD_AVATAR user {}: {}", event.userId(), e.getMessage());
        }
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void onProfileCompleted(ProfileCompletedEvent event) {
        try {
            chibiService.awardXp(event.userId(), XpSource.COMPLETE_PROFILE, "Completed profile details");
        } catch (Exception e) {
            log.error("XP award failed for COMPLETE_PROFILE user {}: {}", event.userId(), e.getMessage());
        }
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void onDailyLogin(DailyLoginEvent event) {
        try {
            LocalDateTime startOfToday = LocalDate.now().atStartOfDay();
            if (xpEventRepository.existsByUserIdAndSourceAndCreatedAtAfter(
                    event.userId(), XpSource.DAILY_LOGIN, startOfToday)) {
                return; // already awarded today
            }
            chibiService.awardXp(event.userId(), XpSource.DAILY_LOGIN, "Daily login");
        } catch (Exception e) {
            log.error("XP award failed for DAILY_LOGIN user {}: {}", event.userId(), e.getMessage());
        }
    }
}
