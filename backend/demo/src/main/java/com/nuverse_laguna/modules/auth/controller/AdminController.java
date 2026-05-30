package com.nuverse_laguna.modules.auth.controller;

import com.nuverse_laguna.modules.auth.domain.User;
import com.nuverse_laguna.modules.auth.dto.UserResponse;
import com.nuverse_laguna.modules.auth.mapper.UserMapper;
import com.nuverse_laguna.modules.auth.repository.UserRepository;
import com.nuverse_laguna.shared.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

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
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @PatchMapping("/users/{id}/suspend")
    public ResponseEntity<ApiResponse<UserResponse>> suspend(@PathVariable java.util.UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new com.nuverse_laguna.shared.exception.ResourceNotFoundException("User", id));
        user.suspend();
        return ResponseEntity.ok(ApiResponse.success(userMapper.toResponse(userRepository.save(user))));
    }
}
