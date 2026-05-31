package com.nuverse_laguna.modules.announcements.application;

import com.nuverse_laguna.modules.announcements.domain.AnnouncementPriority;
import com.nuverse_laguna.modules.announcements.domain.EmergencyAnnouncement;
import com.nuverse_laguna.modules.announcements.dto.AnnouncementResponse;
import com.nuverse_laguna.modules.announcements.dto.CreateAnnouncementRequest;
import com.nuverse_laguna.modules.announcements.repository.AnnouncementRepository;
import com.nuverse_laguna.shared.exception.AppException;
import com.nuverse_laguna.shared.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AnnouncementServiceImpl")
class AnnouncementServiceImplTest {

    @Mock AnnouncementRepository repository;
    @Mock com.nuverse_laguna.modules.announcements.repository.AnnouncementReactionRepository reactionRepository;
    @Mock com.nuverse_laguna.modules.profile.repository.UserProfileRepository profileRepository;

    AnnouncementServiceImpl service;

    static final UUID ADMIN_ID = UUID.randomUUID();
    static final UUID ANN_ID   = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        service = new AnnouncementServiceImpl(repository, reactionRepository, profileRepository);
    }

    // ── create ────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("create: valid request saves and returns response")
    void create_valid_savesAndReturns() {
        CreateAnnouncementRequest req = new CreateAnnouncementRequest(
                "Enrollment Open", "Portal is open for enrollment.", "IMPORTANT",
                LocalDateTime.now().plusDays(7), null);
        when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        AnnouncementResponse response = service.create(ADMIN_ID, req);

        assertThat(response.title()).isEqualTo("Enrollment Open");
        assertThat(response.priority()).isEqualTo("IMPORTANT");
        assertThat(response.active()).isTrue();
        verify(repository).save(any(EmergencyAnnouncement.class));
    }

    @Test
    @DisplayName("create: invalid priority throws 400")
    void create_invalidPriority_throws400() {
        CreateAnnouncementRequest req = new CreateAnnouncementRequest(
                "Test", "Body", "INVALID_PRIORITY", null, null);

        assertThatThrownBy(() -> service.create(ADMIN_ID, req))
                .isInstanceOf(AppException.class)
                .satisfies(ex -> assertThat(((AppException) ex).getStatus()).isEqualTo(HttpStatus.BAD_REQUEST));
    }

    // ── getEffective ──────────────────────────────────────────────────────────

    @Test
    @DisplayName("getEffective: returns list of active non-expired announcements")
    void getEffective_returnsActive() {
        EmergencyAnnouncement ann = EmergencyAnnouncement.create(
                "Title", "Body", AnnouncementPriority.GENERAL, ADMIN_ID,
                LocalDateTime.now().plusDays(1));
        when(repository.findEffective(any())).thenReturn(List.of(ann));

        List<AnnouncementResponse> result = service.getEffective();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).title()).isEqualTo("Title");
    }

    @Test
    @DisplayName("getEffective: returns empty list when no active announcements")
    void getEffective_empty_returnsEmptyList() {
        when(repository.findEffective(any())).thenReturn(List.of());
        assertThat(service.getEffective()).isEmpty();
    }

    // ── getAll ────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("getAll: returns paginated announcements")
    void getAll_returnsPaginatedResults() {
        EmergencyAnnouncement ann = EmergencyAnnouncement.create(
                "Title", "Body", AnnouncementPriority.IMPORTANT, ADMIN_ID, null);
        Page<EmergencyAnnouncement> page = new PageImpl<>(List.of(ann), PageRequest.of(0, 20), 1);
        when(repository.findAllByOrderByCreatedAtDesc(any())).thenReturn(page);

        Page<AnnouncementResponse> result = service.getAll(PageRequest.of(0, 20));

        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent().get(0).title()).isEqualTo("Title");
    }

    // ── deactivate ────────────────────────────────────────────────────────────

    @Test
    @DisplayName("deactivate: found announcement is deactivated")
    void deactivate_found_deactivatesAnnouncement() {
        EmergencyAnnouncement ann = EmergencyAnnouncement.create(
                "Title", "Body", AnnouncementPriority.GENERAL, ADMIN_ID, null);
        when(repository.findById(ANN_ID)).thenReturn(Optional.of(ann));
        when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        AnnouncementResponse response = service.deactivate(ANN_ID, ADMIN_ID);

        assertThat(response.active()).isFalse();
        verify(repository).save(any(EmergencyAnnouncement.class));
    }

    @Test
    @DisplayName("deactivate: not found throws ResourceNotFoundException")
    void deactivate_notFound_throwsNotFoundException() {
        when(repository.findById(ANN_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.deactivate(ANN_ID, ADMIN_ID))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
