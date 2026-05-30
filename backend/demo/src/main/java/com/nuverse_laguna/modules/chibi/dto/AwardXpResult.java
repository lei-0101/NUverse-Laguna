package com.nuverse_laguna.modules.chibi.dto;

public record AwardXpResult(
        int xpGained,
        int totalXp,
        int level,
        boolean leveledUp,
        String title
) {}
