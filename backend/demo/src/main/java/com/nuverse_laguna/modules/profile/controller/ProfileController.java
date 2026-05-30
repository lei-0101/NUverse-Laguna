package com.nuverse_laguna.modules.profile.controller;

import com.nuverse_laguna.modules.profile.application.ProfileService;
import com.nuverse_laguna.modules.profile.domain.ProfileVisibility;
import com.nuverse_laguna.modules.profile.dto.FollowSummary;
import com.nuverse_laguna.modules.profile.dto.ProfileResponse;
import com.nuverse_laguna.modules.profile.dto.PublicProfileResponse;
import com.nuverse_laguna.modules.profile.dto.UpdatePrivacyRequest;
import com.nuverse_laguna.modules.profile.dto.UpdateProfileRequest;
import com.nuverse_laguna.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<ProfileResponse>> getMyProfile(Authentication auth) {
        UUID userId = resolveUserId(auth);
        return ResponseEntity.ok(ApiResponse.ok("Profile retrieved", profileService.getMyProfile(userId)));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<ProfileResponse>> updateProfile(
            Authentication auth,
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        UUID userId = resolveUserId(auth);
        return ResponseEntity.ok(ApiResponse.ok("Profile updated", profileService.updateProfile(userId, request)));
    }

    @PostMapping(value = "/me/avatar", consumes = "multipart/form-data")
    public ResponseEntity<ApiResponse<ProfileResponse>> uploadAvatar(
            Authentication auth,
            @RequestParam("file") MultipartFile file
    ) {
        UUID userId = resolveUserId(auth);
        return ResponseEntity.ok(ApiResponse.ok("Avatar updated", profileService.updateAvatar(userId, file)));
    }

    @DeleteMapping("/me/avatar")
    public ResponseEntity<ApiResponse<ProfileResponse>> removeAvatar(Authentication auth) {
        UUID userId = resolveUserId(auth);
        return ResponseEntity.ok(ApiResponse.ok("Avatar removed", profileService.removeAvatar(userId)));
    }

    @PatchMapping("/me/privacy")
    public ResponseEntity<ApiResponse<ProfileResponse>> updatePrivacy(
            Authentication auth,
            @Valid @RequestBody UpdatePrivacyRequest request
    ) {
        UUID userId = resolveUserId(auth);
        return ResponseEntity.ok(ApiResponse.ok("Privacy settings updated",
                profileService.updatePrivacy(userId, request)));
    }

    @PatchMapping("/me/visibility")
    public ResponseEntity<ApiResponse<Void>> changeVisibility(
            Authentication auth,
            @RequestParam ProfileVisibility visibility
    ) {
        UUID userId = resolveUserId(auth);
        profileService.changeVisibility(userId, visibility);
        return ResponseEntity.ok(ApiResponse.ok("Visibility updated to " + visibility.name()));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<PublicProfileResponse>> getPublicProfile(
            Authentication auth,
            @PathVariable UUID userId
    ) {
        UUID viewerId = resolveUserId(auth);
        return ResponseEntity.ok(ApiResponse.ok("Profile retrieved", profileService.getPublicProfile(viewerId, userId)));
    }

    @PostMapping("/{userId}/follow")
    public ResponseEntity<ApiResponse<Void>> follow(Authentication auth, @PathVariable UUID userId) {
        UUID followerId = resolveUserId(auth);
        profileService.follow(followerId, userId);
        return ResponseEntity.ok(ApiResponse.ok("Now following user"));
    }

    @DeleteMapping("/{userId}/follow")
    public ResponseEntity<ApiResponse<Void>> unfollow(Authentication auth, @PathVariable UUID userId) {
        UUID followerId = resolveUserId(auth);
        profileService.unfollow(followerId, userId);
        return ResponseEntity.ok(ApiResponse.ok("Unfollowed user"));
    }

    @GetMapping("/me/followers")
    public ResponseEntity<ApiResponse<Page<FollowSummary>>> getFollowers(
            Authentication auth,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        UUID userId = resolveUserId(auth);
        return ResponseEntity.ok(ApiResponse.ok("Followers retrieved",
                profileService.getFollowers(userId, PageRequest.of(page, size))));
    }

    @GetMapping("/me/following")
    public ResponseEntity<ApiResponse<Page<FollowSummary>>> getFollowing(
            Authentication auth,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        UUID userId = resolveUserId(auth);
        return ResponseEntity.ok(ApiResponse.ok("Following retrieved",
                profileService.getFollowing(userId, PageRequest.of(page, size))));
    }

    private UUID resolveUserId(Authentication auth) {
        return UUID.fromString((String) auth.getPrincipal());
    }
}
