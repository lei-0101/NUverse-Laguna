package com.nuverse_laguna.modules.chibi.domain;

import org.springframework.stereotype.Component;

/**
 * Determines level tier from cumulative XP.
 * Formula: Level n requires n*(n-1)/2 * 100 XP (triangular numbers × 100).
 * Level 1 = 0 XP, Level 2 = 100, Level 3 = 300, Level 4 = 600, Level 5 = 1000 …
 * Max level: 20.
 */
@Component
public class LevelCalculator {

    private static final int MAX_LEVEL = 20;

    public int levelFor(int totalXp) {
        int level = 1;
        while (level < MAX_LEVEL && totalXp >= xpRequiredForLevel(level + 1)) {
            level++;
        }
        return level;
    }

    /** XP threshold to reach a given level. */
    public int xpRequiredForLevel(int level) {
        if (level <= 1) return 0;
        return (level - 1) * level / 2 * 100;
    }

    /** XP needed to advance from current level to next. */
    public int xpToNextLevel(int currentLevel) {
        if (currentLevel >= MAX_LEVEL) return 0;
        return xpRequiredForLevel(currentLevel + 1) - xpRequiredForLevel(currentLevel);
    }

    public int maxLevel() { return MAX_LEVEL; }

    public String titleFor(int level) {
        return switch (level) {
            case 1, 2  -> "Bulldog Pup";
            case 3, 4  -> "Campus Explorer";
            case 5, 6  -> "Marketplace Regular";
            case 7, 8  -> "NU Enthusiast";
            case 9, 10 -> "Bulldog Veteran";
            case 11,12 -> "Exchange Master";
            case 13,14 -> "Event Legend";
            case 15,16 -> "Campus Champion";
            case 17,18 -> "Bulldog Elite";
            case 19,20 -> "NUverse Legend";
            default    -> "Bulldog";
        };
    }
}
