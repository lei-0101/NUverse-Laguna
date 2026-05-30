package com.nuverse_laguna.modules.profile.application;

import com.nuverse_laguna.modules.profile.domain.Follow;
import com.nuverse_laguna.modules.profile.domain.ProfileVisibility;
import com.nuverse_laguna.modules.profile.domain.UserProfile;
import com.nuverse_laguna.modules.profile.dto.FollowSummary;
import com.nuverse_laguna.modules.profile.dto.ProfileResponse;
import com.nuverse_laguna.modules.profile.dto.PublicProfileResponse;
import com.nuverse_laguna.modules.profile.dto.UpdatePrivacyRequest;
import com.nuverse_laguna.modules.profile.dto.UpdateProfileRequest;
import com.nuverse_laguna.modules.profile.repository.FollowRepository;
import com.nuverse_laguna.modules.profile.repository.UserProfileRepository;
import com.nuverse_laguna.shared.event.UserFollowedEvent;
import com.nuverse_laguna.shared.exception.AppException;
import com.nuverse_laguna.shared.exception.ResourceNotFoundException;
import com.nuverse_laguna.shared.storage.StorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class ProfileServiceImpl implements ProfileService {

    private static final String AVATAR_CATEGORY = "avatars";

    private final UserProfileRepository userProfileRepository;
    private final FollowRepository followRepository;
    private final StorageService storageService;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    public void createProfile(UUID userId, String fullName) {
        if (userProfileRepository.existsByUserId(userId)) {
            log.warn("Profile already exists for user {}, skipping creation", userId);
            return;
        }
        UserProfile profile = UserProfile.createFor(userId, fullName);
        userProfileRepository.save(profile);
        log.info("Profile created for user {}", userId);
    }

    @Override
    @Transactional(readOnly = true)
    public ProfileResponse getMyProfile(UUID userId) {
        UserProfile profile = findProfileByUserId(userId);
        return buildProfileResponse(profile);
    }

    @Override
    public ProfileResponse updateProfile(UUID userId, UpdateProfileRequest request) {
        UserProfile profile = findProfileByUserId(userId);
        profile.updateDetails(
                request.fullName(),
                request.bio(),
                request.course(),
                request.yearLevel(),
                request.interests()
        );
        return buildProfileResponse(userProfileRepository.save(profile));
    }

    @Override
    public ProfileResponse updateAvatar(UUID userId, MultipartFile file) {
        UserProfile profile = findProfileByUserId(userId);
        String previousAvatar = profile.getAvatarUrl();

        String newAvatarUrl = storageService.store(file, AVATAR_CATEGORY);
        profile.updateAvatar(newAvatarUrl);
        ProfileResponse response = buildProfileResponse(userProfileRepository.save(profile));

        if (previousAvatar != null) {
            storageService.delete(previousAvatar);
        }
        return response;
    }

    @Override
    public ProfileResponse removeAvatar(UUID userId) {
        UserProfile profile = findProfileByUserId(userId);
        String previousAvatar = profile.getAvatarUrl();

        profile.updateAvatar(null);
        ProfileResponse response = buildProfileResponse(userProfileRepository.save(profile));

        if (previousAvatar != null) {
            storageService.delete(previousAvatar);
        }
        return response;
    }

    @Override
    public ProfileResponse updatePrivacy(UUID userId, UpdatePrivacyRequest request) {
        UserProfile profile = findProfileByUserId(userId);
        profile.updatePrivacy(request.hideMarketplaceActivity(), request.hideChibiShowcase());
        return buildProfileResponse(userProfileRepository.save(profile));
    }

    @Override
    public void changeVisibility(UUID userId, ProfileVisibility visibility) {
        UserProfile profile = findProfileByUserId(userId);
        profile.changeVisibility(visibility);
        userProfileRepository.save(profile);
    }

    @Override
    @Transactional(readOnly = true)
    public PublicProfileResponse getPublicProfile(UUID viewerId, UUID targetUserId) {
        UserProfile profile = findProfileByUserId(targetUserId);

        boolean isFollowing = followRepository.existsByFollowerIdAndFollowingId(viewerId, targetUserId);
        boolean isOwner = viewerId.equals(targetUserId);
        boolean canViewDetails = profile.isPublic() || isOwner || isFollowing;

        long followerCount = followRepository.countByFollowingId(targetUserId);
        long followingCount = followRepository.countByFollowerId(targetUserId);

        return new PublicProfileResponse(
                profile.getUserId(),
                profile.getFullName(),
                profile.getAvatarUrl(),
                canViewDetails ? profile.getBio() : null,
                canViewDetails ? profile.getCourse() : null,
                canViewDetails && profile.getYearLevel() != null ? profile.getYearLevel().name() : null,
                canViewDetails ? profile.getInterests() : null,
                followerCount,
                followingCount,
                isFollowing,
                !profile.isPublic()
        );
    }

    @Override
    public void follow(UUID followerId, UUID targetUserId) {
        if (!userProfileRepository.existsByUserId(targetUserId)) {
            throw new ResourceNotFoundException("Profile", targetUserId);
        }
        if (followRepository.existsByFollowerIdAndFollowingId(followerId, targetUserId)) {
            throw new AppException(HttpStatus.CONFLICT, "You are already following this user");
        }
        followRepository.save(Follow.create(followerId, targetUserId));

        String followerName = userProfileRepository.findByUserId(followerId)
                .map(UserProfile::getFullName)
                .orElse("Someone");
        eventPublisher.publishEvent(new UserFollowedEvent(followerId, followerName, targetUserId));
    }

    @Override
    public void unfollow(UUID followerId, UUID targetUserId) {
        if (!followRepository.existsByFollowerIdAndFollowingId(followerId, targetUserId)) {
            throw new AppException(HttpStatus.NOT_FOUND, "You are not following this user");
        }
        followRepository.deleteByFollowerIdAndFollowingId(followerId, targetUserId);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<FollowSummary> getFollowers(UUID userId, Pageable pageable) {
        return userProfileRepository.findFollowerProfiles(userId, pageable)
                .map(p -> new FollowSummary(p.getUserId(), p.getFullName(), p.getAvatarUrl()));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<FollowSummary> getFollowing(UUID userId, Pageable pageable) {
        return userProfileRepository.findFollowingProfiles(userId, pageable)
                .map(p -> new FollowSummary(p.getUserId(), p.getFullName(), p.getAvatarUrl()));
    }

    private UserProfile findProfileByUserId(UUID userId) {
        return userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile", userId));
    }

    private ProfileResponse buildProfileResponse(UserProfile profile) {
        long followerCount = followRepository.countByFollowingId(profile.getUserId());
        long followingCount = followRepository.countByFollowerId(profile.getUserId());
        return new ProfileResponse(
                profile.getId(),
                profile.getUserId(),
                profile.getFullName(),
                profile.getAvatarUrl(),
                profile.getBio(),
                profile.getCourse(),
                profile.getYearLevel() != null ? profile.getYearLevel().name() : null,
                profile.getInterests(),
                profile.getVisibility().name(),
                profile.isHideMarketplaceActivity(),
                profile.isHideChibiShowcase(),
                followerCount,
                followingCount,
                profile.getCreatedAt()
        );
    }
}
