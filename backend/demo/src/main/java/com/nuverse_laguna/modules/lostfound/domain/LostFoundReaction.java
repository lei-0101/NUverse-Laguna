package com.nuverse_laguna.modules.lostfound.domain;

import com.nuverse_laguna.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "lost_found_reactions",
        uniqueConstraints = @UniqueConstraint(columnNames = {"item_id", "user_id"}))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class LostFoundReaction extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "item_id", nullable = false)
    private LostFoundItem item;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "emoji", nullable = false, length = 10)
    private String emoji;

    public static LostFoundReaction create(LostFoundItem item, UUID userId, String emoji) {
        LostFoundReaction r = new LostFoundReaction();
        r.item = item;
        r.userId = userId;
        r.emoji = emoji != null ? emoji : "👍";
        return r;
    }
}
