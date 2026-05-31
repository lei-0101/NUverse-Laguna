package com.nuverse_laguna.modules.messaging.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record ConversationResponse(
        UUID id,
        UUID otherUserId,
        String otherUserName,
        String otherUserAvatar,
        String lastMessage,
        LocalDateTime lastMessageAt,
        long unreadCount
) {}
