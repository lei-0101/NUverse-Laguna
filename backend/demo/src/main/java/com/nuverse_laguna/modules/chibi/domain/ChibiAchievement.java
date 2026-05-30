package com.nuverse_laguna.modules.chibi.domain;

import com.nuverse_laguna.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "chibi_achievements")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ChibiAchievement extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "achievement", nullable = false, length = 100)
    private String achievement;

    @Column(name = "unlocked_at", nullable = false)
    private LocalDateTime unlockedAt;

    public static ChibiAchievement unlock(UUID userId, String achievement) {
        ChibiAchievement a = new ChibiAchievement();
        a.userId = userId;
        a.achievement = achievement;
        a.unlockedAt = LocalDateTime.now();
        return a;
    }
}
