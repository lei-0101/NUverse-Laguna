package com.nuverse_laguna.modules.events.repository;

import com.nuverse_laguna.modules.events.domain.EventComment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface EventCommentRepository extends JpaRepository<EventComment, UUID> {
    List<EventComment> findByEventIdOrderByCreatedAtAsc(UUID eventId);
    long countByEventId(UUID eventId);
}
