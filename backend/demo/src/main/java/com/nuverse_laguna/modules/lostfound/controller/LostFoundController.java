package com.nuverse_laguna.modules.lostfound.controller;

import com.nuverse_laguna.modules.lostfound.application.LostFoundService;
import com.nuverse_laguna.modules.lostfound.dto.CreateLostFoundRequest;
import com.nuverse_laguna.modules.lostfound.dto.LostFoundItemResponse;
import com.nuverse_laguna.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/lost-found")
@RequiredArgsConstructor
public class LostFoundController {

    private final LostFoundService lostFoundService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<LostFoundItemResponse>>> browse(
            @RequestParam(required = false) String type,
            @RequestParam(defaultValue = "OPEN") String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                lostFoundService.browse(type, status, PageRequest.of(page, size))));
    }

    @GetMapping("/mine")
    public ResponseEntity<ApiResponse<Page<LostFoundItemResponse>>> getMine(
            Authentication auth,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        UUID userId = UUID.fromString((String) auth.getPrincipal());
        return ResponseEntity.ok(ApiResponse.success(
                lostFoundService.getMine(userId, PageRequest.of(page, size))));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<LostFoundItemResponse>> create(
            Authentication auth,
            @Valid @RequestBody CreateLostFoundRequest request
    ) {
        UUID userId = UUID.fromString((String) auth.getPrincipal());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(lostFoundService.create(userId, request)));
    }

    @PatchMapping("/{id}/resolve")
    public ResponseEntity<ApiResponse<LostFoundItemResponse>> resolve(
            @PathVariable UUID id,
            Authentication auth
    ) {
        UUID userId = UUID.fromString((String) auth.getPrincipal());
        return ResponseEntity.ok(ApiResponse.success(lostFoundService.resolve(id, userId)));
    }
}
