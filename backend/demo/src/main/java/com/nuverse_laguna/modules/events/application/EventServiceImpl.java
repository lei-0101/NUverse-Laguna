package com.nuverse_laguna.modules.events.application;

import com.nuverse_laguna.modules.events.domain.*;
import com.nuverse_laguna.modules.events.dto.*;
import com.nuverse_laguna.modules.events.repository.*;
import com.nuverse_laguna.modules.profile.domain.UserProfile;
import com.nuverse_laguna.modules.profile.repository.UserProfileRepository;
import com.nuverse_laguna.shared.dto.ReactionSummary;
import com.nuverse_laguna.shared.event.EventRsvpEvent;
import com.nuverse_laguna.shared.exception.AppException;
import com.nuverse_laguna.shared.exception.ResourceNotFoundException;
import com.nuverse_laguna.shared.storage.StorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
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
@Slf4j
public class EventServiceImpl implements EventService {

    private static final String EVENTS_STORAGE_CATEGORY = "events";

    private final CampusEventRepository eventRepository;
    private final EventRsvpRepository rsvpRepository;
    private final EventReactionRepository reactionRepository;
    private final EventCommentRepository commentRepository;
    private final UserProfileRepository profileRepository;
    private final StorageService storageService;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    public EventResponse createEvent(UUID creatorId, CreateEventRequest req) {
        CampusEvent event = CampusEvent.create(
                creatorId, req.title(), req.description(), req.category(),
                req.location(), req.startTime(), req.endTime(),
                req.coverImageUrl(), req.capacity());
        eventRepository.save(event);
        log.debug("Event '{}' created as DRAFT by {}", event.getTitle(), creatorId);
        return toResponse(event, 0L, false);
    }

    @Override
    @Transactional(readOnly = true)
    public EventResponse getEvent(UUID eventId, UUID viewerId) {
        CampusEvent event = findEventOrThrow(eventId);
        long rsvpCount = rsvpRepository.countByEventIdAndStatus(eventId, RsvpStatus.ATTENDING);
        boolean isRsvpd = rsvpRepository.existsByEventIdAndUserIdAndStatus(eventId, viewerId, RsvpStatus.ATTENDING);
        return toResponseWithUser(event, rsvpCount, isRsvpd, viewerId);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<EventCardResponse> getEvents(EventCategory category, EventStatus status,
                                              Boolean upcomingOnly, Pageable pageable) {
        Specification<CampusEvent> spec = EventSpecification.build(category, status, upcomingOnly);
        return eventRepository.findAll(spec, pageable)
                .map(event -> {
                    long count = rsvpRepository.countByEventIdAndStatus(event.getId(), RsvpStatus.ATTENDING);
                    return toCard(event, count);
                });
    }

    @Override
    public EventResponse updateEvent(UUID requesterId, UUID eventId, UpdateEventRequest req) {
        CampusEvent event = findEventOrThrow(eventId);
        assertEditorAccess(requesterId, event);
        event.updateDetails(req.title(), req.description(), req.category(),
                req.location(), req.startTime(), req.endTime(),
                req.coverImageUrl(), req.capacity());
        long rsvpCount = rsvpRepository.countByEventIdAndStatus(eventId, RsvpStatus.ATTENDING);
        boolean isRsvpd = rsvpRepository.existsByEventIdAndUserIdAndStatus(eventId, requesterId, RsvpStatus.ATTENDING);
        return toResponse(event, rsvpCount, isRsvpd);
    }

    @Override
    public EventResponse publishEvent(UUID requesterId, UUID eventId) {
        CampusEvent event = findEventOrThrow(eventId);
        assertEditorAccess(requesterId, event);
        event.publish();
        long rsvpCount = rsvpRepository.countByEventIdAndStatus(eventId, RsvpStatus.ATTENDING);
        return toResponse(event, rsvpCount, false);
    }

    @Override
    public EventResponse cancelEvent(UUID requesterId, UUID eventId) {
        CampusEvent event = findEventOrThrow(eventId);
        event.cancel();
        log.debug("Event '{}' cancelled by {}", event.getTitle(), requesterId);
        long rsvpCount = rsvpRepository.countByEventIdAndStatus(eventId, RsvpStatus.ATTENDING);
        return toResponse(event, rsvpCount, false);
    }

    @Override
    public void deleteEvent(UUID requesterId, UUID eventId) {
        CampusEvent event = findEventOrThrow(eventId);
        if (event.getStatus() != EventStatus.DRAFT) {
            throw new AppException(HttpStatus.CONFLICT, "Only draft events can be deleted");
        }
        if (event.getCoverImageUrl() != null) {
            storageService.delete(event.getCoverImageUrl());
        }
        eventRepository.delete(event);
        log.debug("Draft event '{}' deleted by {}", event.getTitle(), requesterId);
    }

    @Override
    public EventResponse rsvp(UUID userId, UUID eventId) {
        CampusEvent event = findEventOrThrow(eventId);

        if (!event.isRsvpOpen()) {
            throw new AppException(HttpStatus.CONFLICT, "RSVP is not open for this event");
        }

        if (rsvpRepository.existsByEventIdAndUserIdAndStatus(eventId, userId, RsvpStatus.ATTENDING)) {
            throw new DuplicateRsvpException();
        }

        if (event.getCapacity() != null) {
            long currentCount = rsvpRepository.countByEventIdAndStatus(eventId, RsvpStatus.ATTENDING);
            if (currentCount >= event.getCapacity()) {
                throw new EventCapacityExceededException();
            }
        }

        // Re-use an existing cancelled RSVP row rather than violating the unique constraint
        EventRsvp rsvp = rsvpRepository.findByEventIdAndUserId(eventId, userId)
                .map(existing -> {
                    existing.cancel(); // reset to ATTENDING below
                    return existing;
                })
                .orElseGet(() -> EventRsvp.create(eventId, userId));

        // If we fetched a cancelled row, flip status back to ATTENDING
        if (rsvp.getStatus() == RsvpStatus.CANCELLED) {
            EventRsvp fresh = EventRsvp.create(eventId, userId);
            rsvpRepository.delete(rsvp);
            rsvp = fresh;
        }

        rsvpRepository.save(rsvp);

        long rsvpCount = rsvpRepository.countByEventIdAndStatus(eventId, RsvpStatus.ATTENDING);
        log.debug("User {} RSVP'd to event '{}'", userId, event.getTitle());

        eventPublisher.publishEvent(new EventRsvpEvent(this, eventId, userId, event.getTitle(), event.getStartTime()));

        return toResponse(event, rsvpCount, true);
    }

    @Override
    public void cancelRsvp(UUID userId, UUID eventId) {
        EventRsvp rsvp = rsvpRepository.findByEventIdAndUserId(eventId, userId)
                .filter(r -> r.getStatus() == RsvpStatus.ATTENDING)
                .orElseThrow(() -> new ResourceNotFoundException("RSVP for this event", eventId));
        rsvp.cancel();
        log.debug("User {} cancelled RSVP for event {}", userId, eventId);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<RsvpResponse> getMyRsvps(UUID userId, Pageable pageable) {
        return rsvpRepository.findByUserIdAndStatus(userId, RsvpStatus.ATTENDING, pageable)
                .map(rsvp -> {
                    CampusEvent event = findEventOrThrow(rsvp.getEventId());
                    return new RsvpResponse(
                            rsvp.getId(),
                            event.getId(),
                            event.getTitle(),
                            event.getLocation(),
                            event.getStartTime(),
                            event.getStatus().name(),
                            rsvp.getStatus().name(),
                            rsvp.getCreatedAt()
                    );
                });
    }

    @Override
    public List<RsvpResponse> getAttendees(UUID eventId) {
        return rsvpRepository.findAllByEventIdAndStatus(eventId, RsvpStatus.ATTENDING).stream()
                .map(rsvp -> {
                    CampusEvent event = findEventOrThrow(rsvp.getEventId());
                    return new RsvpResponse(rsvp.getId(), event.getId(), event.getTitle(),
                            event.getLocation(), event.getStartTime(), event.getStatus().name(),
                            rsvp.getStatus().name(), rsvp.getCreatedAt());
                }).toList();
    }

    @Override
    public EventResponse toggleReaction(UUID eventId, UUID userId, String emoji) {
        CampusEvent event = findEventOrThrow(eventId);
        Optional<EventReaction> existing = reactionRepository.findByEventIdAndUserId(eventId, userId);
        if (existing.isPresent()) {
            reactionRepository.deleteByEventIdAndUserId(eventId, userId);
        } else {
            reactionRepository.save(EventReaction.create(eventId, userId, emoji));
        }
        long rsvpCount = rsvpRepository.countByEventIdAndStatus(eventId, RsvpStatus.ATTENDING);
        boolean isRsvpd = rsvpRepository.existsByEventIdAndUserIdAndStatus(eventId, userId, RsvpStatus.ATTENDING);
        return toResponseWithUser(event, rsvpCount, isRsvpd, userId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReactionSummary> getReactions(UUID eventId) {
        List<EventReaction> reactions = reactionRepository.findAllByEventId(eventId);
        List<UUID> userIds = reactions.stream().map(EventReaction::getUserId).toList();
        Map<UUID, UserProfile> profiles = profileRepository.findByUserIdIn(userIds).stream()
                .collect(Collectors.toMap(UserProfile::getUserId, p -> p));
        return reactions.stream()
                .map(r -> new ReactionSummary(
                        r.getUserId(),
                        profiles.containsKey(r.getUserId()) ? profiles.get(r.getUserId()).getFullName() : "Unknown",
                        profiles.containsKey(r.getUserId()) ? profiles.get(r.getUserId()).getAvatarUrl() : null,
                        r.getEmoji()
                )).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventCommentResponse> getComments(UUID eventId) {
        return commentRepository.findByEventIdOrderByCreatedAtAsc(eventId).stream()
                .map(c -> new EventCommentResponse(c.getId(), c.getAuthorId(), c.getAuthorName(), c.getBody(), c.getCreatedAt()))
                .toList();
    }

    @Override
    public EventCommentResponse addComment(UUID eventId, UUID authorId, String authorName, String body) {
        CampusEvent event = findEventOrThrow(eventId);
        EventComment comment = commentRepository.save(EventComment.create(eventId, authorId, authorName, body));
        return new EventCommentResponse(comment.getId(), comment.getAuthorId(), comment.getAuthorName(), comment.getBody(), comment.getCreatedAt());
    }

    @Override
    public void deleteComment(UUID commentId, UUID userId) {
        EventComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment", commentId));
        if (!comment.getAuthorId().equals(userId)) {
            throw new AppException(HttpStatus.FORBIDDEN, "Only the comment author can delete it");
        }
        commentRepository.delete(comment);
    }

    @Override
    public void adminDeleteComment(UUID commentId) {
        EventComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment", commentId));
        commentRepository.delete(comment);
    }

    @Override
    public UploadImageResponse uploadImage(MultipartFile file) {
        String url = storageService.store(file, EVENTS_STORAGE_CATEGORY);
        return new UploadImageResponse(url);
    }

    // ─── Private helpers ──────────────────────────────────────────────────────

    private CampusEvent findEventOrThrow(UUID eventId) {
        return eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event", eventId));
    }

    /** Only the event creator (or admin, handled at the controller @PreAuthorize level) may edit. */
    private void assertEditorAccess(UUID requesterId, CampusEvent event) {
        if (!event.isCreatedBy(requesterId)) {
            throw new AppException(HttpStatus.FORBIDDEN, "You do not have permission to modify this event");
        }
    }

    private EventResponse toResponse(CampusEvent e, long rsvpCount, boolean isRsvpd) {
        return toResponseWithUser(e, rsvpCount, isRsvpd, null);
    }

    private EventResponse toResponseWithUser(CampusEvent e, long rsvpCount, boolean isRsvpd, UUID userId) {
        long reactionCount = reactionRepository.countByEventId(e.getId());
        long commentCount  = commentRepository.countByEventId(e.getId());
        String userReaction = userId != null
                ? reactionRepository.findByEventIdAndUserId(e.getId(), userId).map(EventReaction::getEmoji).orElse(null)
                : null;
        return new EventResponse(
                e.getId(), e.getCreatorId(), e.getTitle(), e.getDescription(),
                e.getCategory().name(), e.getLocation(), e.getStartTime(), e.getEndTime(),
                e.getCoverImageUrl(), e.getCapacity(), e.getStatus().name(),
                rsvpCount, e.isRsvpOpen(), isRsvpd, e.getCreatedAt(),
                reactionCount, userReaction, commentCount
        );
    }

    private EventCardResponse toCard(CampusEvent e, long rsvpCount) {
        return new EventCardResponse(
                e.getId(), e.getTitle(), e.getCategory().name(), e.getLocation(),
                e.getStartTime(), e.getEndTime(), e.getStatus().name(),
                e.getCoverImageUrl(), rsvpCount, e.getCapacity()
        );
    }
}
