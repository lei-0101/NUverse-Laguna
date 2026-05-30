package com.nuverse_laguna.modules.chibi.domain;

import org.springframework.stereotype.Component;

/**
 * Factory for XP strategies.
 * Each source maps to a concrete strategy — fulfils the Strategy Pattern requirement.
 * Flat strategies are used for most sources; some scale with level to keep earning meaningful.
 */
@Component
public class XpStrategyFactory {

    public XpStrategy forSource(XpSource source) {
        return switch (source) {
            case REGISTRATION         -> level -> 100;
            case COMPLETE_PROFILE     -> level -> 50;
            case UPLOAD_AVATAR        -> level -> 30;
            case FIRST_LISTING        -> level -> 80;
            case LISTING_SOLD         -> level -> 60;
            case MAKE_RESERVATION     -> level -> 40;
            case RSVP_EVENT           -> level -> 30;
            case FOLLOW_USER          -> level -> 20;
            case DAILY_LOGIN          -> level -> Math.max(5, 5 + level);     // scales with level
            case LOST_FOUND_POST      -> level -> 35;
            case LOST_FOUND_RESOLVED  -> level -> 50;
        };
    }
}
