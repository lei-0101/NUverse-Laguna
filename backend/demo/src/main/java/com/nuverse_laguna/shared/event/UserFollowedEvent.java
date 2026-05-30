package com.nuverse_laguna.shared.event;

import java.util.UUID;

/**
 * Published when one user follows another.
 * followerName — the display name of the person who clicked "Follow"
 * followedUserId — the user who receives the notification
 */
public record UserFollowedEvent(UUID followerId, String followerName, UUID followedUserId) {}
