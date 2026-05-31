package com.nuverse_laguna.modules.messaging.domain;

import com.nuverse_laguna.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "conversations")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Conversation extends BaseEntity {

    @Column(name = "user_a_id", nullable = false)
    private UUID userAId;

    @Column(name = "user_b_id", nullable = false)
    private UUID userBId;

    /** Always stores user_a_id < user_b_id to enforce uniqueness. */
    public static Conversation create(UUID user1, UUID user2) {
        Conversation c = new Conversation();
        // Ensure canonical order so the UNIQUE constraint works
        if (user1.compareTo(user2) <= 0) {
            c.userAId = user1;
            c.userBId = user2;
        } else {
            c.userAId = user2;
            c.userBId = user1;
        }
        return c;
    }

    public UUID getOtherUserId(UUID myId) {
        return myId.equals(userAId) ? userBId : userAId;
    }
}
