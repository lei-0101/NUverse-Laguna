package com.nuverse_laguna.modules.messaging.application;

import com.nuverse_laguna.modules.messaging.dto.ConversationResponse;
import com.nuverse_laguna.modules.messaging.dto.MessageResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface MessagingService {
    List<ConversationResponse> getConversations(UUID userId);
    ConversationResponse getOrCreateConversation(UUID userId, UUID otherUserId);
    Page<MessageResponse> getMessages(UUID userId, UUID conversationId, Pageable pageable);
    MessageResponse sendMessage(UUID senderId, UUID conversationId, String body);
    long getUnreadCount(UUID userId);
}
