package com.nuverse_laguna.modules.profile.repository;

import com.nuverse_laguna.modules.profile.domain.Follow;
import com.nuverse_laguna.modules.profile.domain.FollowStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FollowRepository extends JpaRepository<Follow, UUID> {

    boolean existsByFollowerIdAndFollowingId(UUID followerId, UUID followingId);

    Optional<Follow> findByFollowerIdAndFollowingId(UUID followerId, UUID followingId);

    @Query("SELECT COUNT(f) FROM Follow f WHERE f.followingId = :userId AND f.status = 'ACCEPTED'")
    long countByFollowingId(@Param("userId") UUID userId);

    @Query("SELECT COUNT(f) FROM Follow f WHERE f.followerId = :userId AND f.status = 'ACCEPTED'")
    long countByFollowerId(@Param("userId") UUID userId);

    @Query("SELECT COUNT(f) FROM Follow f WHERE f.followingId = :userId AND f.status = 'PENDING'")
    long countPendingByFollowingId(@Param("userId") UUID userId);

    @Query("SELECT f FROM Follow f WHERE f.followingId = :userId AND f.status = 'PENDING'")
    List<Follow> findPendingByFollowingId(@Param("userId") UUID userId);

    boolean existsByFollowerIdAndFollowingIdAndStatus(UUID followerId, UUID followingId, FollowStatus status);

    @Modifying
    @Query("DELETE FROM Follow f WHERE f.followerId = :followerId AND f.followingId = :followingId")
    void deleteByFollowerIdAndFollowingId(
            @Param("followerId") UUID followerId,
            @Param("followingId") UUID followingId
    );
}
