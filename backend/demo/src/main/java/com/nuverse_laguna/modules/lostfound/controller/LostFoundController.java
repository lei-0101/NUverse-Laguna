package com.nuverse_laguna.modules.lostfound.controller;

import com.nuverse_laguna.modules.lostfound.application.LostFoundService;
import com.nuverse_laguna.modules.lostfound.dto.*;
import com.nuverse_laguna.modules.profile.repository.UserProfileRepository;
import com.nuverse_laguna.shared.dto.ReactionSummary;
import com.nuverse_laguna.shared.response.ApiResponse;
import org.springframework.security.access.prepost.PreAuthorize;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/lost-found")
@RequiredArgsConstructor
public class LostFoundController {

    private final LostFoundService lostFoundService;
    private final UserProfileRepository profileRepository;

    @PostMapping(value = "/images", consumes = "multipart/form-data")
    public ResponseEntity<ApiResponse<UploadImageResponse>> uploadImage(
            @RequestParam("file") MultipartFile file
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Image uploaded", lostFoundService.uploadImage(file)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<LostFoundItemResponse>>> browse(
            @RequestParam(required = false) String type,
            @RequestParam(defaultValue = "OPEN") String status,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            Authentication auth
    ) {
        UUID userId = auth != null ? UUID.fromString((String) auth.getPrincipal()) : null;
        return ResponseEntity.ok(ApiResponse.ok("Items retrieved",
                lostFoundService.browse(type, status, keyword, PageRequest.of(page, size))));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<LostFoundItemResponse>> getOne(
            @PathVariable UUID id,
            Authentication auth
    ) {
        UUID userId = auth != null ? UUID.fromString((String) auth.getPrincipal()) : null;
        return ResponseEntity.ok(ApiResponse.ok("Item retrieved", lostFoundService.getById(id, userId)));
    }

    @GetMapping("/mine")
    public ResponseEntity<ApiResponse<Page<LostFoundItemResponse>>> getMine(
            Authentication auth,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        UUID userId = UUID.fromString((String) auth.getPrincipal());
        return ResponseEntity.ok(ApiResponse.ok("My items retrieved",
                lostFoundService.getMine(userId, PageRequest.of(page, size))));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<LostFoundItemResponse>> create(
            Authentication auth,
            @Valid @RequestBody CreateLostFoundRequest request
    ) {
        UUID userId = UUID.fromString((String) auth.getPrincipal());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Item posted", lostFoundService.create(userId, request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<LostFoundItemResponse>> update(
            @PathVariable UUID id,
            Authentication auth,
            @Valid @RequestBody UpdateLostFoundRequest request
    ) {
        UUID userId = UUID.fromString((String) auth.getPrincipal());
        return ResponseEntity.ok(ApiResponse.ok("Item updated", lostFoundService.update(id, userId, request)));
    }

    @PatchMapping("/{id}/resolve")
    public ResponseEntity<ApiResponse<LostFoundItemResponse>> resolve(
            @PathVariable UUID id,
            Authentication auth
    ) {
        UUID userId = UUID.fromString((String) auth.getPrincipal());
        return ResponseEntity.ok(ApiResponse.ok("Item resolved", lostFoundService.resolve(id, userId)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable UUID id,
            Authentication auth
    ) {
        UUID userId = UUID.fromString((String) auth.getPrincipal());
        lostFoundService.delete(id, userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/react")
    public ResponseEntity<ApiResponse<LostFoundItemResponse>> react(
            @PathVariable UUID id,
            @RequestParam(defaultValue = "👍") String emoji,
            Authentication auth
    ) {
        UUID userId = UUID.fromString((String) auth.getPrincipal());
        return ResponseEntity.ok(ApiResponse.ok("Reaction toggled", lostFoundService.toggleReaction(id, userId, emoji)));
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<ApiResponse<List<LostFoundCommentResponse>>> getComments(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(ApiResponse.ok("Comments retrieved", lostFoundService.getComments(id)));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<ApiResponse<LostFoundCommentResponse>> addComment(
            @PathVariable UUID id,
            Authentication auth,
            @Valid @RequestBody AddCommentRequest request
    ) {
        UUID userId = UUID.fromString((String) auth.getPrincipal());
        String name = profileRepository.findByUserId(userId)
                .map(p -> p.getFullName()).orElse("Unknown");
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Comment added", lostFoundService.addComment(id, userId, name, request)));
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable UUID commentId,
            Authentication auth
    ) {
        UUID userId = UUID.fromString((String) auth.getPrincipal());
        lostFoundService.deleteComment(commentId, userId);
        return ResponseEntity.noContent().build();
    }

    /** Admin: permanently delete any comment. */
    @DeleteMapping("/comments/{commentId}/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> adminDeleteComment(@PathVariable UUID commentId) {
        lostFoundService.adminDeleteComment(commentId);
        return ResponseEntity.noContent().build();
    }

    /** Admin: permanently delete any lost & found post. */
    @DeleteMapping("/{id}/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> adminDelete(@PathVariable UUID id) {
        lostFoundService.adminDelete(id);
        return ResponseEntity.noContent().build();
    }

    /** Get all reactions for an item (who reacted + their emoji). */
    @GetMapping("/{id}/reactions")
    public ResponseEntity<ApiResponse<List<ReactionSummary>>> getReactions(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok("Reactions retrieved", lostFoundService.getReactions(id)));
    }
}
