package com.nuverse_laguna.modules.chibi.application;

import com.nuverse_laguna.modules.chibi.domain.*;
import com.nuverse_laguna.modules.chibi.dto.AwardXpResult;
import com.nuverse_laguna.modules.chibi.dto.ChibiProfileResponse;
import com.nuverse_laguna.modules.chibi.repository.ChibiAchievementRepository;
import com.nuverse_laguna.modules.chibi.repository.ChibiProfileRepository;
import com.nuverse_laguna.modules.chibi.repository.ChibiXpEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class ChibiServiceImpl implements ChibiService {

    private final ChibiProfileRepository profileRepository;
    private final ChibiXpEventRepository xpEventRepository;
    private final ChibiAchievementRepository achievementRepository;
    private final XpStrategyFactory strategyFactory;
    private final LevelCalculator levelCalculator;

    @Override
    public ChibiProfileResponse getOrCreate(UUID userId) {
        ChibiProfile profile = profileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    String title = levelCalculator.titleFor(1);
                    ChibiProfile p = ChibiProfile.create(userId, title);
                    return profileRepository.save(p);
                });
        return toResponse(profile);
    }

    @Override
    public AwardXpResult awardXp(UUID userId, XpSource source, String description) {
        ChibiProfile profile = profileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    String title = levelCalculator.titleFor(1);
                    return profileRepository.save(ChibiProfile.create(userId, title));
                });

        int previousLevel = profile.getLevel();
        int xpGained = strategyFactory.forSource(source).calculate(profile.getLevel());
        int newLevel = levelCalculator.levelFor(profile.getXp() + xpGained);
        String newTitle = levelCalculator.titleFor(newLevel);

        profile.addXp(xpGained, newLevel, newTitle);
        profileRepository.save(profile);

        xpEventRepository.save(ChibiXpEvent.record(userId, source, xpGained, description));

        boolean leveledUp = newLevel > previousLevel;
        if (leveledUp) {
            log.info("User {} leveled up to {} ({})", userId, newLevel, newTitle);
            checkAndAwardAchievements(userId, newLevel);
        }

        return new AwardXpResult(xpGained, profile.getXp(), newLevel, leveledUp, newTitle);
    }

    @Override
    @Transactional(readOnly = true)
    public ChibiProfileResponse getForUser(UUID userId) {
        ChibiProfile profile = profileRepository.findByUserId(userId)
                .orElseGet(() -> ChibiProfile.create(userId, levelCalculator.titleFor(1)));
        return toResponse(profile);
    }

    private void checkAndAwardAchievements(UUID userId, int level) {
        if (level >= 5 && !achievementRepository.existsByUserIdAndAchievement(userId, "LEVEL_5")) {
            achievementRepository.save(ChibiAchievement.unlock(userId, "LEVEL_5"));
        }
        if (level >= 10 && !achievementRepository.existsByUserIdAndAchievement(userId, "LEVEL_10")) {
            achievementRepository.save(ChibiAchievement.unlock(userId, "LEVEL_10"));
        }
        if (level >= 20 && !achievementRepository.existsByUserIdAndAchievement(userId, "MAX_LEVEL")) {
            achievementRepository.save(ChibiAchievement.unlock(userId, "MAX_LEVEL"));
        }
    }

    private ChibiProfileResponse toResponse(ChibiProfile profile) {
        List<String> achievements = achievementRepository.findByUserId(profile.getUserId())
                .stream().map(ChibiAchievement::getAchievement).toList();
        int level = profile.getLevel();
        int xpForCurrent = levelCalculator.xpRequiredForLevel(level);
        int xpForNext = levelCalculator.xpRequiredForLevel(level + 1);
        int xpToNext = levelCalculator.xpToNextLevel(level);
        return new ChibiProfileResponse(
                profile.getUserId(), profile.getXp(), level, profile.getTitle(),
                xpToNext, xpForCurrent, xpForNext, achievements, profile.getCreatedAt()
        );
    }
}
