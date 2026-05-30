package com.nuverse_laguna.modules.profile.domain;

import com.nuverse_laguna.shared.entity.BaseEntity;
import com.nuverse_laguna.shared.exception.AppException;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus;

import java.util.UUID;

@Entity
@Table(
        name = "follows",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_follows_follower_following",
                columnNames = {"follower_id", "following_id"}
        )
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Follow extends BaseEntity {

    @Column(name = "follower_id", nullable = false)
    private UUID followerId;

    @Column(name = "following_id", nullable = false)
    private UUID followingId;

    public static Follow create(UUID followerId, UUID followingId) {
        if (followerId.equals(followingId)) {
            throw new AppException(HttpStatus.BAD_REQUEST, "You cannot follow yourself");
        }
        Follow follow = new Follow();
        follow.followerId = followerId;
        follow.followingId = followingId;
        return follow;
    }
}
