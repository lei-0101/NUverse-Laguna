package com.nuverse_laguna.modules.events.repository;

import com.nuverse_laguna.modules.events.domain.CampusEvent;
import com.nuverse_laguna.modules.events.domain.EventCategory;
import com.nuverse_laguna.modules.events.domain.EventStatus;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.stream.Stream;

public final class EventSpecification {

    private EventSpecification() {}

    public static Specification<CampusEvent> build(EventCategory category,
                                                    EventStatus status,
                                                    Boolean upcomingOnly) {
        Specification<CampusEvent> byCategory = category == null ? null
                : (root, q, cb) -> cb.equal(root.get("category"), category);

        Specification<CampusEvent> byStatus = status == null ? null
                : (root, q, cb) -> cb.equal(root.get("status"), status);

        Specification<CampusEvent> upcoming = Boolean.TRUE.equals(upcomingOnly) ? null : null;
        if (Boolean.TRUE.equals(upcomingOnly)) {
            upcoming = (root, q, cb) -> cb.greaterThan(root.get("startTime"), LocalDateTime.now());
        }

        final Specification<CampusEvent> finalUpcoming = upcoming;

        return Stream.of(byCategory, byStatus, finalUpcoming)
                .filter(Objects::nonNull)
                .reduce(Specification::and)
                .orElse((root, q, cb) -> cb.conjunction());
    }
}
