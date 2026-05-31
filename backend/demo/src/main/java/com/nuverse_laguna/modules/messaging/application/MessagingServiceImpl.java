package com.nuverse_laguna.modules.messaging.application;

import com.nuverse_laguna.modules.messaging.domain.Conversation;
import com.nuverse_laguna.modules.messaging.domain.Message;
import com.nuverse_laguna.modules.messaging.dto.ConversationResponse;
import com.nuverse_laguna.modules.messaging.dto.MessageResponse;
import com.nuverse_laguna.modules.messaging.repository.ConversationRepository;
import com.nuverse_laguna.modules.messaging.repository.MessageRepository;
import com.nuverse_laguna.modules.profile.domain.UserProfile;
import com.nuverse_laguna.modules.profile.repository.UserProfileRepository;
import com.nuverse_laguna.shared.exception.AppException;
import com.nuverse_laguna.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class MessagingServiceImpl implements MessagingService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final UserProfileRepository userProfileRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ConversationResponse> getConversations(UUID userId) {
        List<Conversation> conversations = conversationRepository.findByUserId(userId);
        Set<UUID> otherIds = conversations.stream()
                .map(c -> c.getOtherUserId(userId))
                .collect(Collectors.toSet());

        Map<UUID, UserProfile> profiles = userProfileRepository.findByUserIdIn(otherIds).stream()
                .collect(Collectors.toMap(UserProfile::getUserId, p -> p));

        return conversations.stream().map(conv -> {
            UUID otherId = conv.getOtherUserId(userId);
            UserProfile other = profiles.get(otherId);
            Message last = messageRepository.findTopByConversationIdOrderByCreatedAtDesc(conv.getId()).orElse(null);
            long unread = messageRepository.countUnreadByConversationAndNotSender(conv.getId(), userId);
            return new ConversationResponse(
                    conv.getId(),
                    otherId,
                    other != null ? other.getFullName() : "Unknown",
                    other != null ? other.getAvatarUrl() : null,
                    last != null ? last.getBody() : null,
                    last != null ? last.getCreatedAt() : null,
                    unread
            );
        }).toList();
    }

    @Override
    public ConversationResponse getOrCreateConversation(UUID userId, UUID otherUserId) {
        if (userId.equals(otherUserId)) {
            throw new AppException(HttpStatus.BAD_REQUEST, "You cannot message yourself");
        }
        Conversation conv = conversationRepository.findByPair(userId, otherUserId)
                .orElseGet(() -> conversationRepository.save(Conversation.create(userId, otherUserId)));

        UserProfile other = userProfileRepository.findByUserId(otherUserId).orElse(null);
        Message last = messageRepository.findTopByConversationIdOrderByCreatedAtDesc(conv.getId()).orElse(null);
        long unread = messageRepository.countUnreadByConversationAndNotSender(conv.getId(), userId);

        return new ConversationResponse(
                conv.getId(),
                otherUserId,
                other != null ? other.getFullName() : "Unknown",
                other != null ? other.getAvatarUrl() : null,
                last != null ? last.getBody() : null,
                last != null ? last.getCreatedAt() : null,
                unread
        );
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MessageResponse> getMessages(UUID userId, UUID conversationId, Pageable pageable) {
        Conversation conv = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation", conversationId));
        if (!conv.getUserAId().equals(userId) && !conv.getUserBId().equals(userId)) {
            throw new AppException(HttpStatus.FORBIDDEN, "Not a participant in this conversation");
        }
        Map<UUID, String> nameCache = java.util.Collections.emptyMap();
        Set<UUID> senderIds = messageRepository
                .findByConversationIdOrderByCreatedAtAsc(conversationId, Pageable.unpaged())
                .stream().map(Message::getSenderId).collect(Collectors.toSet());
        if (!senderIds.isEmpty()) {
            nameCache = userProfileRepository.findByUserIdIn(senderIds).stream()
                    .collect(Collectors.toMap(UserProfile::getUserId, UserProfile::getFullName));
        }
        final Map<UUID, String> names = nameCache;
        return messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId, pageable)
                .map(m -> toResponse(m, names));
    }

    @Override
    public MessageResponse sendMessage(UUID senderId, UUID conversationId, String body) {
        Conversation conv = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation", conversationId));
        if (!conv.getUserAId().equals(senderId) && !conv.getUserBId().equals(senderId)) {
            throw new AppException(HttpStatus.FORBIDDEN, "Not a participant in this conversation");
        }
        Message message = messageRepository.save(Message.create(conversationId, senderId, body));
        String senderName = userProfileRepository.findByUserId(senderId)
                .map(UserProfile::getFullName).orElse("Unknown");
        return toResponse(message, Map.of(senderId, senderName));
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount(UUID userId) {
        return messageRepository.countTotalUnread(userId);
    }

    private MessageResponse toResponse(Message m, Map<UUID, String> names) {
        return new MessageResponse(
                m.getId(),
                m.getConversationId(),
                m.getSenderId(),
                names.getOrDefault(m.getSenderId(), "Unknown"),
                m.getBody(),
                m.isRead(),
                m.getCreatedAt()
        );
    }
}
