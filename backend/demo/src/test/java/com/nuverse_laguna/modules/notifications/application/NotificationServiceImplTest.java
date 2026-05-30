package com.nuverse_laguna.modules.notifications.application;

import com.nuverse_laguna.modules.notifications.domain.Notification;
import com.nuverse_laguna.modules.notifications.domain.NotificationType;
import com.nuverse_laguna.modules.notifications.domain.ReferenceType;
import com.nuverse_laguna.modules.notifications.dto.NotificationResponse;
import com.nuverse_laguna.modules.notifications.dto.UnreadCountResponse;
import com.nuverse_laguna.modules.notifications.repository.NotificationRepository;
import com.nuverse_laguna.shared.exception.AppException;
import com.nuverse_laguna.shared.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("NotificationServiceImpl")
class NotificationServiceImplTest {

    @Mock private NotificationRepository notificationRepository;

    private NotificationServiceImpl service;

    static final UUID RECIPIENT_ID = UUID.randomUUID();
    static final UUID NOTIFICATION_ID = UUID.randomUUID();
    static final UUID REFERENCE_ID = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        service = new NotificationServiceImpl(notificationRepository);
    }

    // ─── create ───────────────────────────────────────────────────────────────

    @Test
    @DisplayName("create: persists a new notification with correct fields")
    void create_persistsNotification() {
        when(notificationRepository.save(any(Notification.class))).thenAnswer(inv -> inv.getArgument(0));

        service.create(RECIPIENT_ID, NotificationType.RESERVATION_CREATED,
                "Reservation Confirmed", "Pick up within 48 hours.",
                REFERENCE_ID, ReferenceType.RESERVATION);

        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository).save(captor.capture());
        Notification saved = captor.getValue();

        assertThat(saved.getRecipientId()).isEqualTo(RECIPIENT_ID);
        assertThat(saved.getType()).isEqualTo(NotificationType.RESERVATION_CREATED);
        assertThat(saved.getTitle()).isEqualTo("Reservation Confirmed");
        assertThat(saved.getReferenceId()).isEqualTo(REFERENCE_ID);
        assertThat(saved.getReferenceType()).isEqualTo(ReferenceType.RESERVATION);
        assertThat(saved.isRead()).isFalse();
    }

    @Test
    @DisplayName("create: persists welcome notification with null reference fields")
    void create_welcome_nullReferencesAllowed() {
        when(notificationRepository.save(any(Notification.class))).thenAnswer(inv -> inv.getArgument(0));

        service.create(RECIPIENT_ID, NotificationType.WELCOME,
                "Welcome!", "Welcome to NUverse.", null, null);

        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository).save(captor.capture());
        assertThat(captor.getValue().getReferenceId()).isNull();
        assertThat(captor.getValue().getReferenceType()).isNull();
    }

    // ─── getMyNotifications ───────────────────────────────────────────────────

    @Test
    @DisplayName("getMyNotifications: returns paginated response DTOs")
    void getMyNotifications_returnsMappedPage() {
        Notification n = buildNotification();
        Page<Notification> pageResult = new PageImpl<>(List.of(n), PageRequest.of(0, 20), 1);

        when(notificationRepository.findByRecipientIdOrderByCreatedAtDesc(eq(RECIPIENT_ID), any()))
                .thenReturn(pageResult);

        Page<NotificationResponse> result = service.getMyNotifications(RECIPIENT_ID, PageRequest.of(0, 20));

        assertThat(result.getTotalElements()).isEqualTo(1);
        NotificationResponse dto = result.getContent().get(0);
        assertThat(dto.type()).isEqualTo("RESERVATION_CREATED");
        assertThat(dto.read()).isFalse();
        assertThat(dto.referenceType()).isEqualTo("RESERVATION");
    }

    // ─── getUnreadCount ───────────────────────────────────────────────────────

    @Test
    @DisplayName("getUnreadCount: returns count of unread notifications")
    void getUnreadCount_returnsCorrectCount() {
        when(notificationRepository.countByRecipientIdAndReadFalse(RECIPIENT_ID)).thenReturn(5L);

        UnreadCountResponse result = service.getUnreadCount(RECIPIENT_ID);

        assertThat(result.count()).isEqualTo(5L);
    }

    // ─── markAsRead ───────────────────────────────────────────────────────────

    @Test
    @DisplayName("markAsRead: sets read=true on the notification")
    void markAsRead_setsReadTrue() {
        Notification n = buildNotification();
        when(notificationRepository.findById(NOTIFICATION_ID)).thenReturn(Optional.of(n));
        when(notificationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        service.markAsRead(RECIPIENT_ID, NOTIFICATION_ID);

        assertThat(n.isRead()).isTrue();
        verify(notificationRepository).save(n);
    }

    @Test
    @DisplayName("markAsRead: not found throws ResourceNotFoundException")
    void markAsRead_notFound_throwsNotFoundException() {
        when(notificationRepository.findById(NOTIFICATION_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.markAsRead(RECIPIENT_ID, NOTIFICATION_ID))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("markAsRead: non-owner gets 403 Forbidden")
    void markAsRead_nonOwner_throwsForbidden() {
        Notification n = buildNotification(); // owned by RECIPIENT_ID
        UUID otherUser = UUID.randomUUID();
        when(notificationRepository.findById(NOTIFICATION_ID)).thenReturn(Optional.of(n));

        assertThatThrownBy(() -> service.markAsRead(otherUser, NOTIFICATION_ID))
                .isInstanceOf(AppException.class)
                .satisfies(ex -> assertThat(((AppException) ex).getStatus()).isEqualTo(HttpStatus.FORBIDDEN));

        verify(notificationRepository, never()).save(any());
    }

    // ─── markAllAsRead ────────────────────────────────────────────────────────

    @Test
    @DisplayName("markAllAsRead: calls bulk update for the recipient only")
    void markAllAsRead_callsBulkUpdate() {
        when(notificationRepository.markAllReadByRecipientId(RECIPIENT_ID)).thenReturn(3);

        service.markAllAsRead(RECIPIENT_ID);

        verify(notificationRepository).markAllReadByRecipientId(RECIPIENT_ID);
    }

    // ─── delete ───────────────────────────────────────────────────────────────

    @Test
    @DisplayName("delete: removes the notification when owner calls it")
    void delete_owner_deletesNotification() {
        Notification n = buildNotification();
        when(notificationRepository.findById(NOTIFICATION_ID)).thenReturn(Optional.of(n));

        service.delete(RECIPIENT_ID, NOTIFICATION_ID);

        verify(notificationRepository).delete(n);
    }

    @Test
    @DisplayName("delete: not found throws ResourceNotFoundException")
    void delete_notFound_throwsNotFoundException() {
        when(notificationRepository.findById(NOTIFICATION_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.delete(RECIPIENT_ID, NOTIFICATION_ID))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("delete: non-owner gets 403 Forbidden")
    void delete_nonOwner_throwsForbidden() {
        Notification n = buildNotification();
        UUID otherUser = UUID.randomUUID();
        when(notificationRepository.findById(NOTIFICATION_ID)).thenReturn(Optional.of(n));

        assertThatThrownBy(() -> service.delete(otherUser, NOTIFICATION_ID))
                .isInstanceOf(AppException.class)
                .satisfies(ex -> assertThat(((AppException) ex).getStatus()).isEqualTo(HttpStatus.FORBIDDEN));

        verify(notificationRepository, never()).delete(any());
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private Notification buildNotification() {
        return Notification.create(
                RECIPIENT_ID,
                NotificationType.RESERVATION_CREATED,
                "Reservation Confirmed",
                "Pick up within 48 hours.",
                REFERENCE_ID,
                ReferenceType.RESERVATION
        );
    }
}
