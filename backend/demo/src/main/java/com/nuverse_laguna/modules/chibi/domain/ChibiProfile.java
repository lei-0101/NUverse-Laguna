package com.nuverse_laguna.modules.chibi.domain;

import com.nuverse_laguna.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "chibi_profiles")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ChibiProfile extends BaseEntity {

    @Column(name = "user_id", nullable = false, unique = true)
    private UUID userId;

    @Column(name = "xp", nullable = false)
    private int xp;

    @Column(name = "level", nullable = false)
    private int level;

    @Column(name = "title", length = 100)
    private String title;

    public static ChibiProfile create(UUID userId, String defaultTitle) {
        ChibiProfile p = new ChibiProfile();
        p.userId = userId;
        p.xp = 0;
        p.level = 1;
        p.title = defaultTitle;
        return p;
    }

    public void addXp(int amount, int newLevel, String defaultTitle) {
        this.xp += amount;
        this.level = newLevel;
        if (this.title == null) this.title = defaultTitle;
    }

    public void equipTitle(String title) {
        this.title = title;
    }
}
