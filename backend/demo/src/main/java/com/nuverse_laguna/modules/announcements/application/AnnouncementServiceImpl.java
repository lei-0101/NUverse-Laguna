package com.nuverse_laguna.modules.announcements.application;

import com.nuverse_laguna.modules.announcements.domain.AnnouncementPriority;
import com.nuverse_laguna.modules.announcements.domain.AnnouncementReaction;
import com.nuverse_laguna.modules.announcements.domain.EmergencyAnnouncement;
import com.nuverse_laguna.modules.announcements.dto.AnnouncementResponse;
import com.nuverse_laguna.modules.announcements.dto.CreateAnnouncementRequest;
import com.nuverse_laguna.modules.announcements.dto.UpdateAnnouncementRequest;
import com.nuverse_laguna.modules.announcements.repository.AnnouncementReactionRepository;
import com.nuverse_laguna.modules.announcements.repository.AnnouncementRepository;
import com.nuverse_laguna.modules.profile.domain.UserProfile;
import com.nuverse_laguna.modules.profile.repository.UserProfileRepository;
import com.nuverse_laguna.shared.dto.ReactionSummary;
import com.nuverse_laguna.shared.exception.AppException;
import com.nuverse_laguna.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class AnnouncementServiceImpl implements AnnouncementService {

    private final AnnouncementRepository repository;
    private final AnnouncementReactionRepository reactionRepository;
    private final UserProfileRepository profileRepository;

    @Override
    public AnnouncementResponse create(UUID adminId, CreateAnnouncementRequest request) {
        AnnouncementPriority priority = parsePriority(request.priority());
        EmergencyAnnouncement a = EmergencyAnnouncement.create(
                request.title(), request.body(), priority, adminId,
                request.expiresAt(), request.imageUrl());
        return toResponse(repository.save(a), adminId);
    }

    @Override
    public AnnouncementResponse update(UUID announcementId, UUID adminId, UpdateAnnouncementRequest request) {
        EmergencyAnnouncement a = findById(announcementId);
        AnnouncementPriority priority = parsePriority(request.priority());
        a.update(request.title(), request.body(), priority, request.expiresAt(), request.imageUrl());
        return toResponse(repository.save(a), adminId);
    }

    @Override
    @Transactional(readOnly = true)
    public AnnouncementResponse getById(UUID announcementId, UUID currentUserId) {
        EmergencyAnnouncement a = findById(announcementId);
        return toResponse(a, currentUserId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AnnouncementResponse> getEffective() {
        return repository.findEffective(LocalDateTime.now()).stream()
                .map(a -> toResponse(a, null))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AnnouncementResponse> getAll(Pageable pageable) {
        return repository.findAllByOrderByCreatedAtDesc(pageable).map(a -> toResponse(a, null));
    }

    @Override
    public AnnouncementResponse deactivate(UUID announcementId, UUID adminId) {
        EmergencyAnnouncement a = findById(announcementId);
        a.deactivate();
        return toResponse(repository.save(a), adminId);
    }

    @Override
    public AnnouncementResponse activate(UUID announcementId, UUID adminId) {
        EmergencyAnnouncement a = findById(announcementId);
        a.activate();
        return toResponse(repository.save(a), adminId);
    }

    @Override
    public void delete(UUID announcementId, UUID adminId) {
        EmergencyAnnouncement a = findById(announcementId);
        reactionRepository.findByAnnouncementId(announcementId).forEach(reactionRepository::delete);
        repository.delete(a);
    }

    @Override
    public AnnouncementResponse toggleReaction(UUID announcementId, UUID userId, String emoji) {
        EmergencyAnnouncement a = findById(announcementId);
        Optional<AnnouncementReaction> existing = reactionRepository.findByAnnouncementIdAndUserId(announcementId, userId);
        if (existing.isPresent()) {
            reactionRepository.deleteByAnnouncementIdAndUserId(announcementId, userId);
        } else {
            reactionRepository.save(AnnouncementReaction.create(a, userId, emoji));
        }
        return toResponse(a, userId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReactionSummary> getReactions(UUID announcementId) {
        List<AnnouncementReaction> reactions = reactionRepository.findByAnnouncementId(announcementId);
        List<UUID> userIds = reactions.stream().map(AnnouncementReaction::getUserId).toList();
        java.util.Map<UUID, UserProfile> profiles = profileRepository.findByUserIdIn(userIds).stream()
                .collect(java.util.stream.Collectors.toMap(UserProfile::getUserId, p -> p));
        return reactions.stream()
                .map(r -> new ReactionSummary(
                        r.getUserId(),
                        profiles.getOrDefault(r.getUserId(), null) != null
                                ? profiles.get(r.getUserId()).getFullName() : "Unknown",
                        profiles.getOrDefault(r.getUserId(), null) != null
                                ? profiles.get(r.getUserId()).getAvatarUrl() : null,
                        r.getEmoji()
                ))
                .toList();
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private EmergencyAnnouncement findById(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Announcement", id));
    }

    private AnnouncementPriority parsePriority(String priority) {
        try {
            return AnnouncementPriority.valueOf(priority.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Invalid priority: " + priority);
        }
    }

    private AnnouncementResponse toResponse(EmergencyAnnouncement a, UUID currentUserId) {
        long reactionCount = reactionRepository.countByAnnouncementId(a.getId());
        String userReaction = null;
        if (currentUserId != null) {
            userReaction = reactionRepository.findByAnnouncementIdAndUserId(a.getId(), currentUserId)
                    .map(AnnouncementReaction::getEmoji)
                    .orElse(null);
        }
        return new AnnouncementResponse(
                a.getId(), a.getTitle(), a.getBody(), a.getPriority().name(),
                a.getCreatedBy(), a.isActive(), a.getExpiresAt(), a.getCreatedAt(),
                a.getImageUrl(), reactionCount, userReaction
        );
    }
}
