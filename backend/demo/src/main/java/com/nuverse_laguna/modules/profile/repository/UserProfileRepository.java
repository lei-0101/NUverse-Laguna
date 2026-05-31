package com.nuverse_laguna.modules.profile.repository;

import com.nuverse_laguna.modules.profile.domain.UserProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserProfileRepository extends JpaRepository<UserProfile, UUID> {

    Optional<UserProfile> findByUserId(UUID userId);

    boolean existsByUserId(UUID userId);

    List<UserProfile> findByUserIdIn(Collection<UUID> userIds);

    List<UserProfile> findAllByUserIdIn(Collection<UUID> userIds);

    @Query("SELECT up FROM UserProfile up WHERE up.userId IN " +
           "(SELECT f.followerId FROM Follow f WHERE f.followingId = :userId)")
    Page<UserProfile> findFollowerProfiles(@Param("userId") UUID userId, Pageable pageable);

    @Query("SELECT up FROM UserProfile up WHERE up.userId IN " +
           "(SELECT f.followingId FROM Follow f WHERE f.followerId = :userId)")
    Page<UserProfile> findFollowingProfiles(@Param("userId") UUID userId, Pageable pageable);
}
