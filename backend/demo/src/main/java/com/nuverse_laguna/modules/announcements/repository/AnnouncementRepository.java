package com.nuverse_laguna.modules.announcements.repository;

import com.nuverse_laguna.modules.announcements.domain.EmergencyAnnouncement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface AnnouncementRepository extends JpaRepository<EmergencyAnnouncement, UUID> {

    /** All active, non-expired announcements ordered by priority then recency. */
    @Query("SELECT a FROM EmergencyAnnouncement a WHERE a.active = true AND (a.expiresAt IS NULL OR a.expiresAt > :now) ORDER BY a.priority DESC, a.createdAt DESC")
    List<EmergencyAnnouncement> findEffective(@org.springframework.data.repository.query.Param("now") LocalDateTime now);

    Page<EmergencyAnnouncement> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
