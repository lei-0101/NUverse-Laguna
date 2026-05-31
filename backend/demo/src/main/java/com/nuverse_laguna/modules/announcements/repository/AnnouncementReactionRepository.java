package com.nuverse_laguna.modules.announcements.repository;

import com.nuverse_laguna.modules.announcements.domain.AnnouncementReaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AnnouncementReactionRepository extends JpaRepository<AnnouncementReaction, UUID> {

    List<AnnouncementReaction> findByAnnouncementId(UUID announcementId);

    Optional<AnnouncementReaction> findByAnnouncementIdAndUserId(UUID announcementId, UUID userId);

    long countByAnnouncementId(UUID announcementId);

    boolean existsByAnnouncementIdAndUserId(UUID announcementId, UUID userId);

    void deleteByAnnouncementIdAndUserId(UUID announcementId, UUID userId);
}
