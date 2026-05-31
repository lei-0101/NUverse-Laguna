package com.nuverse_laguna.modules.chibi.application;

import com.nuverse_laguna.modules.chibi.domain.*;
import com.nuverse_laguna.modules.chibi.dto.AwardXpResult;
import com.nuverse_laguna.modules.chibi.dto.ChibiProfileResponse;
import com.nuverse_laguna.modules.chibi.repository.ChibiAchievementRepository;
import com.nuverse_laguna.modules.chibi.repository.ChibiProfileRepository;
import com.nuverse_laguna.modules.chibi.repository.ChibiXpEventRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@DisplayName("ChibiServiceImpl")
class ChibiServiceImplTest {

    @Mock ChibiProfileRepository profileRepository;
    @Mock ChibiXpEventRepository xpEventRepository;
    @Mock ChibiAchievementRepository achievementRepository;

    LevelCalculator levelCalculator = new LevelCalculator();
    XpStrategyFactory strategyFactory = new XpStrategyFactory();

    ChibiServiceImpl service;

    static final UUID USER_ID = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        service = new ChibiServiceImpl(profileRepository, xpEventRepository, achievementRepository,
                strategyFactory, levelCalculator);
        when(profileRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(xpEventRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(achievementRepository.findByUserId(any())).thenReturn(List.of());
        when(achievementRepository.existsByUserIdAndAchievement(any(), any())).thenReturn(false);
    }

    // ── getOrCreate ───────────────────────────────────────────────────────────

    @Test
    @DisplayName("getOrCreate: existing profile is returned")
    void getOrCreate_existingProfile_returned() {
        ChibiProfile profile = ChibiProfile.create(USER_ID, "Bulldog Pup");
        when(profileRepository.findByUserId(USER_ID)).thenReturn(Optional.of(profile));

        ChibiProfileResponse response = service.getOrCreate(USER_ID);

        assertThat(response.userId()).isEqualTo(USER_ID);
        assertThat(response.level()).isEqualTo(1);
        assertThat(response.title()).isEqualTo("Bulldog Pup");
        verify(profileRepository, never()).save(any());
    }

    @Test
    @DisplayName("getOrCreate: no profile creates a new one at level 1")
    void getOrCreate_noProfile_createsNew() {
        when(profileRepository.findByUserId(USER_ID)).thenReturn(Optional.empty());

        ChibiProfileResponse response = service.getOrCreate(USER_ID);

        assertThat(response.level()).isEqualTo(1);
        verify(profileRepository).save(any(ChibiProfile.class));
    }

    // ── awardXp ───────────────────────────────────────────────────────────────

    @Test
    @DisplayName("awardXp: XP is added to existing profile")
    void awardXp_existingProfile_addsXp() {
        ChibiProfile profile = ChibiProfile.create(USER_ID, "Bulldog Pup");
        when(profileRepository.findByUserId(USER_ID)).thenReturn(Optional.of(profile));

        AwardXpResult result = service.awardXp(USER_ID, XpSource.RSVP_EVENT, "Test event");

        assertThat(result.xpGained()).isEqualTo(30); // RSVP_EVENT = 30 XP
        assertThat(result.totalXp()).isEqualTo(30);
        verify(xpEventRepository).save(any(ChibiXpEvent.class));
    }

    @Test
    @DisplayName("awardXp: level-up is detected when XP threshold crossed")
    void awardXp_levelUp_detected() {
        // Level 2 requires 100 XP. Award 100 XP for REGISTRATION.
        ChibiProfile profile = ChibiProfile.create(USER_ID, "Bulldog Pup");
        when(profileRepository.findByUserId(USER_ID)).thenReturn(Optional.of(profile));

        AwardXpResult result = service.awardXp(USER_ID, XpSource.REGISTRATION, "Welcome");

        assertThat(result.xpGained()).isEqualTo(100);
        assertThat(result.leveledUp()).isTrue();
        assertThat(result.level()).isEqualTo(2);
        assertThat(result.title()).isEqualTo("Bulldog Pup");
    }

    @Test
    @DisplayName("awardXp: no level-up when XP doesn't cross threshold")
    void awardXp_noLevelUp_whenBelowThreshold() {
        ChibiProfile profile = ChibiProfile.create(USER_ID, "Bulldog Pup");
        when(profileRepository.findByUserId(USER_ID)).thenReturn(Optional.of(profile));

        AwardXpResult result = service.awardXp(USER_ID, XpSource.FOLLOW_USER, "Followed");

        assertThat(result.xpGained()).isEqualTo(20);
        assertThat(result.leveledUp()).isFalse();
    }

    @Test
    @DisplayName("awardXp: creates profile if it doesn't exist yet")
    void awardXp_noProfile_createsAndAddsXp() {
        when(profileRepository.findByUserId(USER_ID)).thenReturn(Optional.empty());

        AwardXpResult result = service.awardXp(USER_ID, XpSource.FOLLOW_USER, "Followed");

        assertThat(result.xpGained()).isEqualTo(20);
        verify(profileRepository, times(2)).save(any(ChibiProfile.class));
    }

    // ── Level calculator sanity ───────────────────────────────────────────────

    @Test
    @DisplayName("LevelCalculator: level 1 at 0 XP, level 2 at 100 XP, level 3 at 300 XP")
    void levelCalculator_thresholds_correct() {
        assertThat(levelCalculator.levelFor(0)).isEqualTo(1);
        assertThat(levelCalculator.levelFor(100)).isEqualTo(2);
        assertThat(levelCalculator.levelFor(299)).isEqualTo(2);
        assertThat(levelCalculator.levelFor(300)).isEqualTo(3);
        assertThat(levelCalculator.levelFor(599)).isEqualTo(3);
        assertThat(levelCalculator.levelFor(600)).isEqualTo(4);
    }

    @Test
    @DisplayName("LevelCalculator.xpToNextLevel: decreases as current level rises")
    void levelCalculator_xpToNext_correct() {
        assertThat(levelCalculator.xpToNextLevel(1)).isEqualTo(100); // 100 - 0
        assertThat(levelCalculator.xpToNextLevel(2)).isEqualTo(200); // 300 - 100
        assertThat(levelCalculator.xpToNextLevel(3)).isEqualTo(300); // 600 - 300
    }
}
