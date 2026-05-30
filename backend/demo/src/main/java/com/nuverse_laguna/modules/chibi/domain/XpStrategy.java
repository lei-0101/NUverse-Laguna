package com.nuverse_laguna.modules.chibi.domain;

/** Strategy interface — each XP source defines how much XP it awards. */
public interface XpStrategy {
    int calculate(int currentLevel);
}
