package com.nuverse_laguna.modules.lostfound.application;

import com.nuverse_laguna.modules.lostfound.domain.*;
import com.nuverse_laguna.modules.lostfound.dto.*;
import com.nuverse_laguna.modules.lostfound.repository.LostFoundCommentRepository;
import com.nuverse_laguna.modules.lostfound.repository.LostFoundReactionRepository;
import com.nuverse_laguna.modules.lostfound.repository.LostFoundRepository;
import com.nuverse_laguna.modules.profile.domain.UserProfile;
import com.nuverse_laguna.modules.profile.repository.UserProfileRepository;
import com.nuverse_laguna.shared.dto.ReactionSummary;
import com.nuverse_laguna.shared.event.LostFoundItemCreatedEvent;
import com.nuverse_laguna.shared.event.LostFoundItemResolvedEvent;
import com.nuverse_laguna.shared.exception.AppException;
import com.nuverse_laguna.shared.exception.ResourceNotFoundException;
import com.nuverse_laguna.shared.storage.StorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class LostFoundServiceImpl implements LostFoundService {

    private static final String IMAGE_CATEGORY = "lostfound";

    private final LostFoundRepository repository;
    private final LostFoundCommentRepository commentRepository;
    private final LostFoundReactionRepository reactionRepository;
    private final UserProfileRepository profileRepository;
    private final StorageService storageService;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    public UploadImageResponse uploadImage(MultipartFile file) {
        return new UploadImageResponse(storageService.store(file, IMAGE_CATEGORY));
    }

    @Override
    public LostFoundItemResponse create(UUID reporterId, CreateLostFoundRequest request) {
        ItemType type = parseType(request.type());
        LostFoundItem item = LostFoundItem.create(
                reporterId, type, request.title(), request.description(),
                request.location(), request.itemDate(), request.imageUrl(), request.contact()
        );
        LostFoundItem saved = repository.save(item);
        eventPublisher.publishEvent(new LostFoundItemCreatedEvent(reporterId, saved.getId(), saved.getTitle()));
        return toResponse(saved, resolveReporterName(reporterId), null);
    }

    @Override
    public LostFoundItemResponse update(UUID itemId, UUID userId, UpdateLostFoundRequest request) {
        LostFoundItem item = findById(itemId);
        if (!item.getReporterId().equals(userId)) {
            throw new AppException(HttpStatus.FORBIDDEN, "Only the reporter can edit this post");
        }
        ItemType type = parseType(request.type());
        item.update(type, request.title(), request.description(),
                request.location(), request.itemDate(), request.imageUrl(), request.contact());
        return toResponse(repository.save(item), resolveReporterName(userId), userId);
    }

    @Override
    @Transactional(readOnly = true)
    public LostFoundItemResponse getById(UUID itemId, UUID currentUserId) {
        LostFoundItem item = findById(itemId);
        String name = resolveReporterName(item.getReporterId());
        return toResponse(item, name, currentUserId);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<LostFoundItemResponse> browse(String type, String status, String keyword, Pageable pageable) {
        ItemStatus s = status != null ? ItemStatus.valueOf(status.toUpperCase()) : ItemStatus.OPEN;
        Page<LostFoundItem> page;
        if (keyword != null && !keyword.isBlank()) {
            page = repository.searchByKeyword(keyword.trim(), s, pageable);
        } else if (type != null) {
            ItemType t = ItemType.valueOf(type.toUpperCase());
            page = repository.findByTypeAndStatusOrderByCreatedAtDesc(t, s, pageable);
        } else {
            page = repository.findByStatusOrderByCreatedAtDesc(s, pageable);
        }
        Map<UUID, String> names = batchLoadNames(page.getContent());
        return page.map(item -> toResponse(item, names.getOrDefault(item.getReporterId(), "Unknown"), null));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<LostFoundItemResponse> getMine(UUID userId, Pageable pageable) {
        String name = resolveReporterName(userId);
        return repository.findByReporterIdOrderByCreatedAtDesc(userId, pageable)
                .map(item -> toResponse(item, name, userId));
    }

    @Override
    public LostFoundItemResponse resolve(UUID itemId, UUID userId) {
        LostFoundItem item = findById(itemId);
        if (!item.isOwnedBy(userId)) {
            throw new AppException(HttpStatus.FORBIDDEN, "Only the reporter can mark this item as resolved");
        }
        item.resolve();
        LostFoundItem saved = repository.save(item);
        eventPublisher.publishEvent(new LostFoundItemResolvedEvent(userId, itemId));
        return toResponse(saved, resolveReporterName(userId), userId);
    }

    @Override
    public void delete(UUID itemId, UUID userId) {
        LostFoundItem item = findById(itemId);
        if (!item.getReporterId().equals(userId)) {
            throw new AppException(HttpStatus.FORBIDDEN, "Only the reporter can delete this item");
        }
        if (item.getImageUrl() != null) storageService.delete(item.getImageUrl());
        commentRepository.deleteByItemId(itemId);
        repository.delete(item);
    }

    @Override
    public void adminDelete(UUID itemId) {
        LostFoundItem item = findById(itemId);
        if (item.getImageUrl() != null) storageService.delete(item.getImageUrl());
        commentRepository.deleteByItemId(itemId);
        repository.delete(item);
    }

    @Override
    public LostFoundItemResponse toggleReaction(UUID itemId, UUID userId, String emoji) {
        LostFoundItem item = findById(itemId);
        Optional<LostFoundReaction> existing = reactionRepository.findByItemIdAndUserId(itemId, userId);
        if (existing.isPresent()) {
            reactionRepository.deleteByItemIdAndUserId(itemId, userId);
        } else {
            reactionRepository.save(LostFoundReaction.create(item, userId, emoji));
        }
        return toResponse(item, resolveReporterName(item.getReporterId()), userId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LostFoundCommentResponse> getComments(UUID itemId) {
        return commentRepository.findByItemIdOrderByCreatedAtAsc(itemId).stream()
                .map(c -> new LostFoundCommentResponse(
                        c.getId(), c.getAuthorId(), c.getAuthorName(), c.getBody(), c.getCreatedAt()))
                .toList();
    }

    @Override
    public LostFoundCommentResponse addComment(UUID itemId, UUID authorId, String authorName, AddCommentRequest request) {
        LostFoundItem item = findById(itemId);
        LostFoundComment comment = LostFoundComment.create(item, authorId, authorName, request.body());
        LostFoundComment saved = commentRepository.save(comment);
        return new LostFoundCommentResponse(saved.getId(), saved.getAuthorId(), saved.getAuthorName(), saved.getBody(), saved.getCreatedAt());
    }

    @Override
    public void deleteComment(UUID commentId, UUID userId) {
        LostFoundComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment", commentId));
        if (!comment.getAuthorId().equals(userId)) {
            throw new AppException(HttpStatus.FORBIDDEN, "Only the comment author can delete it");
        }
        commentRepository.delete(comment);
    }

    @Override
    public void adminDeleteComment(UUID commentId) {
        LostFoundComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment", commentId));
        commentRepository.delete(comment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReactionSummary> getReactions(UUID itemId) {
        List<LostFoundReaction> reactions = reactionRepository.findAllByItemId(itemId);
        List<UUID> userIds = reactions.stream().map(LostFoundReaction::getUserId).toList();
        Map<UUID, UserProfile> profiles = profileRepository.findByUserIdIn(userIds).stream()
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

    // ── Helpers ──────────────────────────────────────────────────────────────

    private LostFoundItem findById(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("LostFoundItem", id));
    }

    private ItemType parseType(String type) {
        try {
            return ItemType.valueOf(type.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Invalid type: must be LOST or FOUND");
        }
    }

    private String resolveReporterName(UUID userId) {
        return profileRepository.findByUserId(userId)
                .map(p -> p.getFullName())
                .orElse("Unknown");
    }

    private Map<UUID, String> batchLoadNames(List<LostFoundItem> items) {
        List<UUID> ids = items.stream().map(LostFoundItem::getReporterId).distinct().toList();
        return profileRepository.findByUserIdIn(ids).stream()
                .collect(Collectors.toMap(p -> p.getUserId(), p -> p.getFullName()));
    }

    private LostFoundItemResponse toResponse(LostFoundItem item, String reporterName, UUID currentUserId) {
        long reactionCount = reactionRepository.countByItemId(item.getId());
        String userReaction = currentUserId != null
                ? reactionRepository.findByItemIdAndUserId(item.getId(), currentUserId)
                        .map(LostFoundReaction::getEmoji).orElse(null)
                : null;
        int commentCount = (int) commentRepository.findByItemIdOrderByCreatedAtAsc(item.getId()).size();
        return new LostFoundItemResponse(
                item.getId(), item.getReporterId(), reporterName,
                item.getType().name(), item.getStatus().name(),
                item.getTitle(), item.getDescription(), item.getLocation(),
                item.getItemDate(), item.getImageUrl(), item.getContact(),
                item.getCreatedAt(), reactionCount, userReaction, commentCount
        );
    }
}
