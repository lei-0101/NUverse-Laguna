package com.nuverse_laguna.modules.announcements.controller;

import com.nuverse_laguna.modules.announcements.application.AnnouncementService;
import com.nuverse_laguna.modules.announcements.dto.AnnouncementResponse;
import com.nuverse_laguna.modules.announcements.dto.CreateAnnouncementRequest;
import com.nuverse_laguna.modules.announcements.dto.UpdateAnnouncementRequest;
import com.nuverse_laguna.shared.dto.ReactionSummary;
import com.nuverse_laguna.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;


@RestController
@RequestMapping("/api/announcements")
@RequiredArgsConstructor
public class AnnouncementController {

    private final AnnouncementService announcementService;

    /** Public endpoint — returns all currently effective announcements for the site-wide banner. */
    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<AnnouncementResponse>>> getActive() {
        return ResponseEntity.ok(ApiResponse.ok("Announcements retrieved", announcementService.getEffective()));
    }

    /** Any authenticated user — browse all announcements newest-first. */
    @GetMapping("/browse")
    public ResponseEntity<ApiResponse<Page<AnnouncementResponse>>> browse(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication auth
    ) {
        UUID userId = auth != null ? UUID.fromString((String) auth.getPrincipal()) : null;
        return ResponseEntity.ok(ApiResponse.ok("Announcements retrieved",
                announcementService.getAll(PageRequest.of(page, size))));
    }

    /** Any authenticated user — get a single announcement by ID. */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AnnouncementResponse>> getOne(
            @PathVariable UUID id,
            Authentication auth
    ) {
        UUID userId = auth != null ? UUID.fromString((String) auth.getPrincipal()) : null;
        return ResponseEntity.ok(ApiResponse.ok("Announcement retrieved",
                announcementService.getById(id, userId)));
    }

    /** Admin/Faculty: list all announcements (paginated). */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    public ResponseEntity<ApiResponse<Page<AnnouncementResponse>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(ApiResponse.ok("Announcements retrieved",
                announcementService.getAll(PageRequest.of(page, size))));
    }

    /** Admin/Faculty: create a new announcement. */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    public ResponseEntity<ApiResponse<AnnouncementResponse>> create(
            Authentication auth,
            @Valid @RequestBody CreateAnnouncementRequest request
    ) {
        UUID userId = UUID.fromString((String) auth.getPrincipal());
        AnnouncementResponse response = announcementService.create(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Announcement created", response));
    }

    /** Admin/Faculty: edit an existing announcement. */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    public ResponseEntity<ApiResponse<AnnouncementResponse>> update(
            @PathVariable UUID id,
            Authentication auth,
            @Valid @RequestBody UpdateAnnouncementRequest request
    ) {
        UUID userId = UUID.fromString((String) auth.getPrincipal());
        return ResponseEntity.ok(ApiResponse.ok("Announcement updated",
                announcementService.update(id, userId, request)));
    }

    /** Admin/Faculty: deactivate (archive) an announcement. */
    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    public ResponseEntity<ApiResponse<AnnouncementResponse>> deactivate(
            @PathVariable UUID id,
            Authentication auth
    ) {
        UUID userId = UUID.fromString((String) auth.getPrincipal());
        return ResponseEntity.ok(ApiResponse.ok("Announcement archived", announcementService.deactivate(id, userId)));
    }

    /** Admin/Faculty: restore (un-archive) an announcement. */
    @PatchMapping("/{id}/activate")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    public ResponseEntity<ApiResponse<AnnouncementResponse>> activateAnn(
            @PathVariable UUID id,
            Authentication auth
    ) {
        UUID userId = UUID.fromString((String) auth.getPrincipal());
        return ResponseEntity.ok(ApiResponse.ok("Announcement restored", announcementService.activate(id, userId)));
    }

    /** Admin only: permanently delete an announcement. */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable UUID id,
            Authentication auth
    ) {
        UUID userId = UUID.fromString((String) auth.getPrincipal());
        announcementService.delete(id, userId);
        return ResponseEntity.ok(ApiResponse.ok("Announcement deleted", null));
    }

    /** Any authenticated user — toggle a reaction on an announcement. */
    @PostMapping("/{id}/react")
    public ResponseEntity<ApiResponse<AnnouncementResponse>> react(
            @PathVariable UUID id,
            @RequestParam(defaultValue = "👍") String emoji,
            Authentication auth
    ) {
        UUID userId = UUID.fromString((String) auth.getPrincipal());
        return ResponseEntity.ok(ApiResponse.ok("Reaction toggled",
                announcementService.toggleReaction(id, userId, emoji)));
    }

    /** Any authenticated user — get all reactions for an announcement. */
    @GetMapping("/{id}/reactions")
    public ResponseEntity<ApiResponse<List<ReactionSummary>>> getReactions(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok("Reactions retrieved",
                announcementService.getReactions(id)));
    }
}
