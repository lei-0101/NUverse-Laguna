package com.nuverse_laguna.modules.events.repository;

import com.nuverse_laguna.modules.events.domain.EventReaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EventReactionRepository extends JpaRepository<EventReaction, UUID> {
    long countByEventId(UUID eventId);
    List<EventReaction> findAllByEventId(UUID eventId);
    Optional<EventReaction> findByEventIdAndUserId(UUID eventId, UUID userId);
    boolean existsByEventIdAndUserId(UUID eventId, UUID userId);
    void deleteByEventIdAndUserId(UUID eventId, UUID userId);
}
