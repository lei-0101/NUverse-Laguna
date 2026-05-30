package com.nuverse_laguna.modules.chibi.domain;

import com.nuverse_laguna.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "chibi_xp_events")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ChibiXpEvent extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "source", nullable = false, length = 50)
    private XpSource source;

    @Column(name = "xp_gained", nullable = false)
    private int xpGained;

    @Column(name = "description", length = 200)
    private String description;

    public static ChibiXpEvent record(UUID userId, XpSource source, int xpGained, String description) {
        ChibiXpEvent e = new ChibiXpEvent();
        e.userId = userId;
        e.source = source;
        e.xpGained = xpGained;
        e.description = description;
        return e;
    }
}
