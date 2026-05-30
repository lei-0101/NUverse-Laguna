package com.nuverse_laguna.modules.events.repository;

import com.nuverse_laguna.modules.events.domain.EventRsvp;
import com.nuverse_laguna.modules.events.domain.RsvpStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface EventRsvpRepository extends JpaRepository<EventRsvp, UUID> {

    boolean existsByEventIdAndUserIdAndStatus(UUID eventId, UUID userId, RsvpStatus status);

    long countByEventIdAndStatus(UUID eventId, RsvpStatus status);

    Optional<EventRsvp> findByEventIdAndUserId(UUID eventId, UUID userId);

    @Query("SELECT r FROM EventRsvp r WHERE r.userId = :userId AND r.status = :status ORDER BY r.createdAt DESC")
    Page<EventRsvp> findByUserIdAndStatus(@Param("userId") UUID userId,
                                          @Param("status") RsvpStatus status,
                                          Pageable pageable);
}
