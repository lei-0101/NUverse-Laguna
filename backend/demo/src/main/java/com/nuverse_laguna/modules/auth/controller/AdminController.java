package com.nuverse_laguna.modules.auth.controller;

import com.nuverse_laguna.modules.auth.domain.User;
import com.nuverse_laguna.modules.auth.dto.SuspendUserRequest;
import com.nuverse_laguna.modules.auth.dto.UserResponse;
import com.nuverse_laguna.modules.auth.mapper.UserMapper;
import com.nuverse_laguna.modules.auth.repository.UserRepository;
import com.nuverse_laguna.shared.exception.ResourceNotFoundException;
import com.nuverse_laguna.shared.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<Page<UserResponse>>> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Page<UserResponse> users = userRepository.findAll(PageRequest.of(page, size))
                .map(userMapper::toResponse);
        return ResponseEntity.ok(ApiResponse.ok("Users retrieved", users));
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getUser(@PathVariable UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
        return ResponseEntity.ok(ApiResponse.ok("User retrieved", userMapper.toResponse(user)));
    }

    @PatchMapping("/users/{id}/suspend")
    public ResponseEntity<ApiResponse<UserResponse>> suspend(
            @PathVariable UUID id,
            @RequestBody(required = false) SuspendUserRequest request
    ) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
        user.suspend(
                request != null ? request.suspendedUntil() : null,
                request != null ? request.reason() : null
        );
        return ResponseEntity.ok(ApiResponse.ok("User suspended", userMapper.toResponse(userRepository.save(user))));
    }

    @PatchMapping("/users/{id}/reactivate")
    public ResponseEntity<ApiResponse<UserResponse>> reactivate(@PathVariable UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
        user.reactivate();
        return ResponseEntity.ok(ApiResponse.ok("User reactivated", userMapper.toResponse(userRepository.save(user))));
    }
}
