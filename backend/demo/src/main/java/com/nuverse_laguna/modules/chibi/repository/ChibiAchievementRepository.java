package com.nuverse_laguna.modules.chibi.repository;

import com.nuverse_laguna.modules.chibi.domain.ChibiAchievement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ChibiAchievementRepository extends JpaRepository<ChibiAchievement, UUID> {
    List<ChibiAchievement> findByUserId(UUID userId);
    boolean existsByUserIdAndAchievement(UUID userId, String achievement);
}
