package com.nuverse_laguna.modules.notifications.application;

import com.nuverse_laguna.modules.notifications.domain.NotificationType;
import com.nuverse_laguna.modules.notifications.domain.ReferenceType;
import com.nuverse_laguna.modules.notifications.dto.NotificationResponse;
import com.nuverse_laguna.modules.notifications.dto.UnreadCountResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface NotificationService {

    void create(UUID recipientId, NotificationType type, String title, String body,
                UUID referenceId, ReferenceType referenceType);

    Page<NotificationResponse> getMyNotifications(UUID recipientId, Pageable pageable);

    UnreadCountResponse getUnreadCount(UUID recipientId);

    void markAsRead(UUID recipientId, UUID notificationId);

    void markAllAsRead(UUID recipientId);

    void delete(UUID recipientId, UUID notificationId);
}
