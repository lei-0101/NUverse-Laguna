package com.nuverse_laguna.modules.notifications.application;

import com.nuverse_laguna.modules.notifications.domain.Notification;
import com.nuverse_laguna.modules.notifications.domain.NotificationType;
import com.nuverse_laguna.modules.notifications.domain.ReferenceType;
import com.nuverse_laguna.modules.notifications.dto.NotificationResponse;
import com.nuverse_laguna.modules.notifications.dto.UnreadCountResponse;
import com.nuverse_laguna.modules.notifications.repository.NotificationRepository;
import com.nuverse_laguna.shared.exception.AppException;
import com.nuverse_laguna.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;

    @Override
    public void create(UUID recipientId, NotificationType type, String title, String body,
                       UUID referenceId, ReferenceType referenceType) {
        Notification notification = Notification.create(recipientId, type, title, body, referenceId, referenceType);
        notificationRepository.save(notification);
        log.debug("Notification [{}] created for recipient {}", type, recipientId);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<NotificationResponse> getMyNotifications(UUID recipientId, Pageable pageable) {
        return notificationRepository
                .findByRecipientIdOrderByCreatedAtDesc(recipientId, pageable)
                .map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public UnreadCountResponse getUnreadCount(UUID recipientId) {
        long count = notificationRepository.countByRecipientIdAndReadFalse(recipientId);
        return new UnreadCountResponse(count);
    }

    @Override
    public void markAsRead(UUID recipientId, UUID notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", notificationId));

        if (!notification.getRecipientId().equals(recipientId)) {
            throw new AppException(HttpStatus.FORBIDDEN, "You do not own this notification");
        }

        notification.markAsRead();
        notificationRepository.save(notification);
    }

    @Override
    public void markAllAsRead(UUID recipientId) {
        notificationRepository.markAllReadByRecipientId(recipientId);
    }

    @Override
    public void delete(UUID recipientId, UUID notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", notificationId));

        if (!notification.getRecipientId().equals(recipientId)) {
            throw new AppException(HttpStatus.FORBIDDEN, "You do not own this notification");
        }

        notificationRepository.delete(notification);
    }

    private NotificationResponse toResponse(Notification n) {
        return new NotificationResponse(
                n.getId(),
                n.getType().name(),
                n.getTitle(),
                n.getBody(),
                n.getReferenceId(),
                n.getReferenceType() != null ? n.getReferenceType().name() : null,
                n.isRead(),
                n.getCreatedAt()
        );
    }
}
