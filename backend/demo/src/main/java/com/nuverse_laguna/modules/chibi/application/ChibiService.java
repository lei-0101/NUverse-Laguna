package com.nuverse_laguna.modules.chibi.application;

import com.nuverse_laguna.modules.chibi.domain.XpSource;
import com.nuverse_laguna.modules.chibi.dto.AwardXpResult;
import com.nuverse_laguna.modules.chibi.dto.ChibiProfileResponse;

import java.util.UUID;

public interface ChibiService {
    /** Get or create a chibi profile for the given user. */
    ChibiProfileResponse getOrCreate(UUID userId);

    /** Award XP to a user for a given source action. */
    AwardXpResult awardXp(UUID userId, XpSource source, String description);

    ChibiProfileResponse getForUser(UUID userId);
}
