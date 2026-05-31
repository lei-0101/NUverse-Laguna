package com.nuverse_laguna.modules.messaging.controller;

import com.nuverse_laguna.modules.messaging.application.MessagingService;
import com.nuverse_laguna.modules.messaging.dto.ConversationResponse;
import com.nuverse_laguna.modules.messaging.dto.MessageResponse;
import com.nuverse_laguna.modules.messaging.dto.SendMessageRequest;
import com.nuverse_laguna.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessagingController {

    private final MessagingService messagingService;

    /** List all conversations for the current user. */
    @GetMapping("/conversations")
    public ResponseEntity<ApiResponse<List<ConversationResponse>>> getConversations(Authentication auth) {
        UUID userId = resolveId(auth);
        return ResponseEntity.ok(ApiResponse.ok("Conversations retrieved",
                messagingService.getConversations(userId)));
    }

    /** Get or create a 1:1 conversation with another user. */
    @PostMapping("/conversations/with/{otherUserId}")
    public ResponseEntity<ApiResponse<ConversationResponse>> getOrCreate(
            Authentication auth,
            @PathVariable UUID otherUserId
    ) {
        UUID userId = resolveId(auth);
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.ok("Conversation ready",
                messagingService.getOrCreateConversation(userId, otherUserId)));
    }

    /** Get paginated messages in a conversation. */
    @GetMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<ApiResponse<Page<MessageResponse>>> getMessages(
            Authentication auth,
            @PathVariable UUID conversationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size
    ) {
        UUID userId = resolveId(auth);
        return ResponseEntity.ok(ApiResponse.ok("Messages retrieved",
                messagingService.getMessages(userId, conversationId, PageRequest.of(page, size))));
    }

    /** Send a message in a conversation. */
    @PostMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<ApiResponse<MessageResponse>> send(
            Authentication auth,
            @PathVariable UUID conversationId,
            @Valid @RequestBody SendMessageRequest request
    ) {
        UUID userId = resolveId(auth);
        MessageResponse msg = messagingService.sendMessage(userId, conversationId, request.body());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Message sent", msg));
    }

    /** Unread message count for the current user. */
    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(Authentication auth) {
        UUID userId = resolveId(auth);
        return ResponseEntity.ok(ApiResponse.ok("Unread count",
                messagingService.getUnreadCount(userId)));
    }

    private UUID resolveId(Authentication auth) {
        return UUID.fromString((String) auth.getPrincipal());
    }
}
