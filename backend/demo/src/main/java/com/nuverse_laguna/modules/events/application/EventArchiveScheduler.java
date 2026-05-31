package com.nuverse_laguna.modules.events.application;

import com.nuverse_laguna.modules.events.domain.CampusEvent;
import com.nuverse_laguna.modules.events.domain.EventStatus;
import com.nuverse_laguna.modules.events.repository.CampusEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class EventArchiveScheduler {

    private final CampusEventRepository eventRepository;

    /** Every 30 minutes — archive finished PUBLISHED events. */
    @Scheduled(fixedDelay = 1_800_000)
    @Transactional
    public void archiveFinishedEvents() {
        Specification<CampusEvent> spec = (root, query, cb) ->
                cb.and(
                        cb.equal(root.get("status"), EventStatus.PUBLISHED),
                        cb.lessThan(root.get("startTime"), LocalDateTime.now())
                );
        List<CampusEvent> finished = eventRepository.findAll(spec);
        if (finished.isEmpty()) return;
        for (CampusEvent e : finished) {
            e.archive();
        }
        eventRepository.saveAll(finished);
        log.info("Archived {} finished event(s).", finished.size());
    }
}
