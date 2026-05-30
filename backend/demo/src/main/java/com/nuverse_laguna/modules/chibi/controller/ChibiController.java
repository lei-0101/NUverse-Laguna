package com.nuverse_laguna.modules.chibi.controller;

import com.nuverse_laguna.modules.chibi.application.ChibiService;
import com.nuverse_laguna.modules.chibi.dto.ChibiProfileResponse;
import com.nuverse_laguna.shared.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/chibi")
@RequiredArgsConstructor
public class ChibiController {

    private final ChibiService chibiService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<ChibiProfileResponse>> getMyProfile(Authentication auth) {
        UUID userId = UUID.fromString((String) auth.getPrincipal());
        return ResponseEntity.ok(ApiResponse.success(chibiService.getOrCreate(userId)));
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<ApiResponse<ChibiProfileResponse>> getUserProfile(
            @PathVariable UUID userId
    ) {
        return ResponseEntity.ok(ApiResponse.success(chibiService.getForUser(userId)));
    }
}
