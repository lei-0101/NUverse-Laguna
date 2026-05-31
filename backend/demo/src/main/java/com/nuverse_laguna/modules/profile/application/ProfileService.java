package com.nuverse_laguna.modules.profile.application;

import com.nuverse_laguna.modules.profile.domain.ProfileVisibility;
import com.nuverse_laguna.modules.profile.dto.FollowSummary;
import com.nuverse_laguna.modules.profile.dto.ProfileResponse;
import com.nuverse_laguna.modules.profile.dto.PublicProfileResponse;
import com.nuverse_laguna.modules.profile.dto.UpdatePrivacyRequest;
import com.nuverse_laguna.modules.profile.dto.UpdateProfileRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface ProfileService {
    void createProfile(UUID userId, String fullName);
    ProfileResponse getMyProfile(UUID userId);
    ProfileResponse updateProfile(UUID userId, UpdateProfileRequest request);
    ProfileResponse updateAvatar(UUID userId, MultipartFile file);
    ProfileResponse removeAvatar(UUID userId);
    ProfileResponse updatePrivacy(UUID userId, UpdatePrivacyRequest request);
    void changeVisibility(UUID userId, ProfileVisibility visibility);
    PublicProfileResponse getPublicProfile(UUID viewerId, UUID targetUserId);
    void follow(UUID followerId, UUID targetUserId);
    void unfollow(UUID followerId, UUID targetUserId);
    void approveFollow(UUID ownerId, UUID followerId);
    void rejectFollow(UUID ownerId, UUID followerId);
    List<FollowSummary> getPendingFollowers(UUID userId);
    Page<FollowSummary> getFollowers(UUID userId, Pageable pageable);
    Page<FollowSummary> getFollowing(UUID userId, Pageable pageable);
}
