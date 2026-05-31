package com.nuverse_laguna.modules.profile.dto;

import java.util.UUID;

// bio, course, yearLevel, interests are null when profile is PRIVATE and viewer is not a follower
public record PublicProfileResponse(
        UUID userId,
        String fullName,
        String avatarUrl,
        String bio,
        String course,
        String yearLevel,
        String interests,
        long followerCount,
        long followingCount,
        boolean isFollowing,
        boolean isFollowPending,
        boolean isPrivate,
        boolean hideChibiShowcase,
        String role
) {}
