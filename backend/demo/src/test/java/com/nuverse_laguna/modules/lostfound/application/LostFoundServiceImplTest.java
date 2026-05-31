package com.nuverse_laguna.modules.lostfound.application;

import com.nuverse_laguna.modules.lostfound.domain.ItemStatus;
import com.nuverse_laguna.modules.lostfound.domain.ItemType;
import com.nuverse_laguna.modules.lostfound.domain.LostFoundItem;
import com.nuverse_laguna.modules.lostfound.dto.CreateLostFoundRequest;
import com.nuverse_laguna.modules.lostfound.dto.LostFoundItemResponse;
import com.nuverse_laguna.modules.lostfound.repository.LostFoundRepository;
import com.nuverse_laguna.modules.profile.domain.UserProfile;
import com.nuverse_laguna.modules.profile.repository.UserProfileRepository;
import com.nuverse_laguna.shared.exception.AppException;
import com.nuverse_laguna.shared.exception.ResourceNotFoundException;
import com.nuverse_laguna.shared.storage.StorageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@DisplayName("LostFoundServiceImpl")
class LostFoundServiceImplTest {

    @Mock LostFoundRepository repository;
    @Mock com.nuverse_laguna.modules.lostfound.repository.LostFoundCommentRepository commentRepository;
    @Mock com.nuverse_laguna.modules.lostfound.repository.LostFoundReactionRepository reactionRepository;
    @Mock UserProfileRepository profileRepository;
    @Mock StorageService storageService;
    @Mock ApplicationEventPublisher eventPublisher;

    LostFoundServiceImpl service;

    static final UUID REPORTER_ID = UUID.randomUUID();
    static final UUID ITEM_ID     = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        service = new LostFoundServiceImpl(repository, commentRepository, reactionRepository, profileRepository, storageService, eventPublisher);
        when(profileRepository.findByUserId(REPORTER_ID))
                .thenReturn(Optional.of(buildProfile("Alex Dela Cruz")));
        when(profileRepository.findByUserIdIn(any())).thenReturn(List.of(buildProfile("Alex Dela Cruz")));
    }

    // ── uploadImage ───────────────────────────────────────────────────────────

    @Test
    @DisplayName("uploadImage: delegates to storage and returns URL")
    void uploadImage_returnsUrl() {
        MultipartFile file = mock(MultipartFile.class);
        when(storageService.store(file, "lostfound")).thenReturn("/uploads/lostfound/img.png");

        assertThat(service.uploadImage(file).url()).isEqualTo("/uploads/lostfound/img.png");
        verify(storageService).store(file, "lostfound");
    }

    // ── create ────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("create: valid LOST item saves and publishes event")
    void create_validLost_savesAndPublishesEvent() {
        CreateLostFoundRequest req = buildRequest("LOST");
        when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        LostFoundItemResponse response = service.create(REPORTER_ID, req);

        assertThat(response.type()).isEqualTo("LOST");
        assertThat(response.status()).isEqualTo("OPEN");
        assertThat(response.reporterName()).isEqualTo("Alex Dela Cruz");
        verify(repository).save(any(LostFoundItem.class));
        verify(eventPublisher).publishEvent(any(Object.class));
    }

    @Test
    @DisplayName("create: valid FOUND item saves and publishes event")
    void create_validFound_saves() {
        CreateLostFoundRequest req = buildRequest("FOUND");
        when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        LostFoundItemResponse response = service.create(REPORTER_ID, req);

        assertThat(response.type()).isEqualTo("FOUND");
    }

    @Test
    @DisplayName("create: invalid type throws 400")
    void create_invalidType_throws400() {
        CreateLostFoundRequest req = buildRequest("INVALID");

        assertThatThrownBy(() -> service.create(REPORTER_ID, req))
                .isInstanceOf(AppException.class)
                .satisfies(ex -> assertThat(((AppException) ex).getStatus()).isEqualTo(HttpStatus.BAD_REQUEST));
    }

    // ── browse ────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("browse: no type filter returns all OPEN items")
    void browse_noTypeFilter_returnsOpenItems() {
        LostFoundItem item = buildItem(ItemType.LOST);
        Page<LostFoundItem> page = new PageImpl<>(List.of(item), PageRequest.of(0, 12), 1);
        when(repository.findByStatusOrderByCreatedAtDesc(ItemStatus.OPEN, PageRequest.of(0, 12)))
                .thenReturn(page);

        Page<LostFoundItemResponse> result = service.browse(null, "OPEN", null, PageRequest.of(0, 12));

        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent().get(0).type()).isEqualTo("LOST");
    }

    @Test
    @DisplayName("browse: type filter delegates to typed repository query")
    void browse_withTypeFilter_usesTypedQuery() {
        LostFoundItem item = buildItem(ItemType.FOUND);
        Page<LostFoundItem> page = new PageImpl<>(List.of(item), PageRequest.of(0, 12), 1);
        when(repository.findByTypeAndStatusOrderByCreatedAtDesc(ItemType.FOUND, ItemStatus.OPEN, PageRequest.of(0, 12)))
                .thenReturn(page);

        Page<LostFoundItemResponse> result = service.browse("FOUND", "OPEN", null, PageRequest.of(0, 12));

        assertThat(result.getContent().get(0).type()).isEqualTo("FOUND");
    }

    // ── resolve ───────────────────────────────────────────────────────────────

    @Test
    @DisplayName("resolve: owner resolves item — status transitions to RESOLVED and event published")
    void resolve_owner_resolvesAndPublishesEvent() {
        LostFoundItem item = buildItem(ItemType.LOST);
        when(repository.findById(ITEM_ID)).thenReturn(Optional.of(item));
        when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        LostFoundItemResponse response = service.resolve(ITEM_ID, REPORTER_ID);

        assertThat(response.status()).isEqualTo("RESOLVED");
        verify(eventPublisher).publishEvent(any(Object.class));
    }

    @Test
    @DisplayName("resolve: non-owner throws 403")
    void resolve_nonOwner_throwsForbidden() {
        LostFoundItem item = buildItem(ItemType.LOST);
        when(repository.findById(ITEM_ID)).thenReturn(Optional.of(item));

        UUID other = UUID.randomUUID();
        assertThatThrownBy(() -> service.resolve(ITEM_ID, other))
                .isInstanceOf(AppException.class)
                .satisfies(ex -> assertThat(((AppException) ex).getStatus()).isEqualTo(HttpStatus.FORBIDDEN));
    }

    @Test
    @DisplayName("resolve: not found throws ResourceNotFoundException")
    void resolve_notFound_throwsNotFoundException() {
        when(repository.findById(ITEM_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.resolve(ITEM_ID, REPORTER_ID))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("resolve: already resolved throws 409")
    void resolve_alreadyResolved_throwsConflict() {
        LostFoundItem item = buildItem(ItemType.LOST);
        item.resolve();
        when(repository.findById(ITEM_ID)).thenReturn(Optional.of(item));

        assertThatThrownBy(() -> service.resolve(ITEM_ID, REPORTER_ID))
                .isInstanceOf(AppException.class)
                .satisfies(ex -> assertThat(((AppException) ex).getStatus()).isEqualTo(HttpStatus.CONFLICT));
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private CreateLostFoundRequest buildRequest(String type) {
        return new CreateLostFoundRequest(type, "Lost umbrella", "Black umbrella",
                "Library 3rd floor", LocalDate.now(), null,
                "alex@students.nu-laguna.edu.ph");
    }

    private LostFoundItem buildItem(ItemType type) {
        return LostFoundItem.create(REPORTER_ID, type, "Lost umbrella", "Black umbrella",
                "Library", LocalDate.now(), null, "contact@example.com");
    }

    private UserProfile buildProfile(String name) {
        return UserProfile.createFor(REPORTER_ID, name);
    }
}
