package com.nuverse_laguna.modules.profile.application;

import com.nuverse_laguna.modules.profile.domain.UserProfile;
import com.nuverse_laguna.modules.profile.dto.ProfileResponse;
import com.nuverse_laguna.modules.profile.dto.UpdatePrivacyRequest;
import com.nuverse_laguna.modules.profile.repository.FollowRepository;
import com.nuverse_laguna.modules.profile.repository.UserProfileRepository;
import com.nuverse_laguna.shared.storage.StorageService;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.context.ApplicationEventPublisher;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ProfileServiceImpl — avatar & privacy")
class ProfileServiceImplTest {

    @Mock private UserProfileRepository userProfileRepository;
    @Mock private FollowRepository followRepository;
    @Mock private StorageService storageService;
    @Mock private ApplicationEventPublisher eventPublisher;
    @Mock private com.nuverse_laguna.modules.auth.repository.UserRepository userRepository;

    private ProfileServiceImpl service;

    private static final UUID USER_ID = UUID.randomUUID();
    private UserProfile profile;

    @BeforeEach
    void setUp() {
        service = new ProfileServiceImpl(userProfileRepository, followRepository, storageService, eventPublisher, userRepository);
        profile = UserProfile.createFor(USER_ID, "Juan Dela Cruz");

        when(userProfileRepository.findByUserId(USER_ID)).thenReturn(Optional.of(profile));
        when(userProfileRepository.save(any(UserProfile.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    private MultipartFile imageFile() {
        return new MockMultipartFile("file", "a.png", "image/png", new byte[]{1, 2, 3});
    }

    @Test
    @DisplayName("uploadAvatar stores the file and sets the returned URL; no prior file to delete")
    void updateAvatar_firstUpload() {
        when(storageService.store(any(), eq("avatars"))).thenReturn("/uploads/avatars/new.png");

        ProfileResponse response = service.updateAvatar(USER_ID, imageFile());

        assertThat(response.avatarUrl()).isEqualTo("/uploads/avatars/new.png");
        verify(storageService, never()).delete(any());
    }

    @Test
    @DisplayName("uploadAvatar deletes the previous file when replacing an existing avatar")
    void updateAvatar_replacesExisting() {
        profile.updateAvatar("/uploads/avatars/old.png");
        when(storageService.store(any(), eq("avatars"))).thenReturn("/uploads/avatars/new.png");

        ProfileResponse response = service.updateAvatar(USER_ID, imageFile());

        assertThat(response.avatarUrl()).isEqualTo("/uploads/avatars/new.png");
        verify(storageService).delete("/uploads/avatars/old.png");
    }

    @Test
    @DisplayName("removeAvatar clears the URL and deletes the stored file")
    void removeAvatar_clearsAndDeletes() {
        profile.updateAvatar("/uploads/avatars/old.png");

        ProfileResponse response = service.removeAvatar(USER_ID);

        assertThat(response.avatarUrl()).isNull();
        verify(storageService).delete("/uploads/avatars/old.png");
        verify(storageService, never()).store(any(), any());
    }

    @Test
    @DisplayName("updatePrivacy persists both toggle values")
    void updatePrivacy_setsFlags() {
        ProfileResponse response = service.updatePrivacy(USER_ID,
                new UpdatePrivacyRequest(true, true));

        assertThat(response.hideMarketplaceActivity()).isTrue();
        assertThat(response.hideChibiShowcase()).isTrue();
        assertThat(profile.isHideMarketplaceActivity()).isTrue();
        assertThat(profile.isHideChibiShowcase()).isTrue();
    }
}
