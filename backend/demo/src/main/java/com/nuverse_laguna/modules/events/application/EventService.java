package com.nuverse_laguna.modules.events.application;

import com.nuverse_laguna.modules.events.domain.EventCategory;
import com.nuverse_laguna.modules.events.domain.EventStatus;
import com.nuverse_laguna.modules.events.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

public interface EventService {

    EventResponse createEvent(UUID creatorId, CreateEventRequest request);

    EventResponse getEvent(UUID eventId, UUID viewerId);

    Page<EventCardResponse> getEvents(EventCategory category, EventStatus status,
                                      Boolean upcomingOnly, Pageable pageable);

    EventResponse updateEvent(UUID requesterId, UUID eventId, UpdateEventRequest request);

    EventResponse publishEvent(UUID requesterId, UUID eventId);

    EventResponse cancelEvent(UUID requesterId, UUID eventId);

    void deleteEvent(UUID requesterId, UUID eventId);

    EventResponse rsvp(UUID userId, UUID eventId);

    void cancelRsvp(UUID userId, UUID eventId);

    Page<RsvpResponse> getMyRsvps(UUID userId, Pageable pageable);

    UploadImageResponse uploadImage(MultipartFile file);
}
