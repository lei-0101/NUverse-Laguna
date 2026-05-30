package com.nuverse_laguna.modules.announcements.controller;

import com.nuverse_laguna.modules.announcements.application.AnnouncementService;
import com.nuverse_laguna.modules.announcements.dto.AnnouncementResponse;
import com.nuverse_laguna.modules.announcements.dto.CreateAnnouncementRequest;
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
        return ResponseEntity.ok(ApiResponse.success(announcementService.getEffective()));
    }

    /** Admin/Faculty: list all announcements (paginated). */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    public ResponseEntity<ApiResponse<Page<AnnouncementResponse>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(ApiResponse.success(
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
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    /** Admin/Faculty: deactivate (soft-delete) an announcement. */
    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    public ResponseEntity<ApiResponse<AnnouncementResponse>> deactivate(
            @PathVariable UUID id,
            Authentication auth
    ) {
        UUID userId = UUID.fromString((String) auth.getPrincipal());
        return ResponseEntity.ok(ApiResponse.success(announcementService.deactivate(id, userId)));
    }
}
