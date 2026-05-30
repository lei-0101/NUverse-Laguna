package com.nuverse_laguna.modules.events.controller;

import com.nuverse_laguna.modules.events.application.EventService;
import com.nuverse_laguna.modules.events.domain.EventCategory;
import com.nuverse_laguna.modules.events.domain.EventStatus;
import com.nuverse_laguna.modules.events.dto.*;
import com.nuverse_laguna.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<EventCardResponse>>> getEvents(
            Authentication auth,
            @RequestParam(required = false) EventCategory category,
            @RequestParam(required = false) EventStatus status,
            @RequestParam(required = false) Boolean upcomingOnly,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "startTime"));
        return ResponseEntity.ok(ApiResponse.ok("Events fetched",
                eventService.getEvents(category, status, upcomingOnly, pageable)));
    }

    @GetMapping("/{eventId}")
    public ResponseEntity<ApiResponse<EventResponse>> getEvent(
            Authentication auth,
            @PathVariable UUID eventId) {
        UUID userId = UUID.fromString(auth.getName());
        return ResponseEntity.ok(ApiResponse.ok("Event fetched", eventService.getEvent(eventId, userId)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    public ResponseEntity<ApiResponse<EventResponse>> createEvent(
            Authentication auth,
            @RequestBody @Valid CreateEventRequest request) {
        UUID creatorId = UUID.fromString(auth.getName());
        EventResponse response = eventService.createEvent(creatorId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Event created", response));
    }

    @PutMapping("/{eventId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    public ResponseEntity<ApiResponse<EventResponse>> updateEvent(
            Authentication auth,
            @PathVariable UUID eventId,
            @RequestBody @Valid UpdateEventRequest request) {
        UUID requesterId = UUID.fromString(auth.getName());
        return ResponseEntity.ok(ApiResponse.ok("Event updated",
                eventService.updateEvent(requesterId, eventId, request)));
    }

    @PatchMapping("/{eventId}/publish")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    public ResponseEntity<ApiResponse<EventResponse>> publishEvent(
            Authentication auth,
            @PathVariable UUID eventId) {
        UUID requesterId = UUID.fromString(auth.getName());
        return ResponseEntity.ok(ApiResponse.ok("Event published",
                eventService.publishEvent(requesterId, eventId)));
    }

    @PatchMapping("/{eventId}/cancel")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<EventResponse>> cancelEvent(
            Authentication auth,
            @PathVariable UUID eventId) {
        UUID requesterId = UUID.fromString(auth.getName());
        return ResponseEntity.ok(ApiResponse.ok("Event cancelled",
                eventService.cancelEvent(requesterId, eventId)));
    }

    @DeleteMapping("/{eventId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteEvent(
            Authentication auth,
            @PathVariable UUID eventId) {
        UUID requesterId = UUID.fromString(auth.getName());
        eventService.deleteEvent(requesterId, eventId);
        return ResponseEntity.ok(ApiResponse.ok("Event deleted"));
    }

    @PostMapping("/{eventId}/rsvp")
    public ResponseEntity<ApiResponse<EventResponse>> rsvp(
            Authentication auth,
            @PathVariable UUID eventId) {
        UUID userId = UUID.fromString(auth.getName());
        return ResponseEntity.ok(ApiResponse.ok("RSVP confirmed", eventService.rsvp(userId, eventId)));
    }

    @DeleteMapping("/{eventId}/rsvp")
    public ResponseEntity<ApiResponse<Void>> cancelRsvp(
            Authentication auth,
            @PathVariable UUID eventId) {
        UUID userId = UUID.fromString(auth.getName());
        eventService.cancelRsvp(userId, eventId);
        return ResponseEntity.ok(ApiResponse.ok("RSVP cancelled"));
    }

    @GetMapping("/my-rsvps")
    public ResponseEntity<ApiResponse<Page<RsvpResponse>>> getMyRsvps(
            Authentication auth,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        UUID userId = UUID.fromString(auth.getName());
        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(ApiResponse.ok("My RSVPs fetched",
                eventService.getMyRsvps(userId, pageable)));
    }

    @PostMapping("/images")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    public ResponseEntity<ApiResponse<UploadImageResponse>> uploadImage(
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Image uploaded", eventService.uploadImage(file)));
    }
}
