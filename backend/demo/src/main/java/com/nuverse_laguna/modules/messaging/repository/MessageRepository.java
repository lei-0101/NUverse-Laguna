package com.nuverse_laguna.modules.messaging.repository;

import com.nuverse_laguna.modules.messaging.domain.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface MessageRepository extends JpaRepository<Message, UUID> {

    Page<Message> findByConversationIdOrderByCreatedAtAsc(UUID conversationId, Pageable pageable);

    Optional<Message> findTopByConversationIdOrderByCreatedAtDesc(UUID conversationId);

    @Query("SELECT COUNT(m) FROM Message m WHERE m.conversationId = :convId AND m.senderId != :userId AND m.read = false")
    long countUnreadByConversationAndNotSender(@Param("convId") UUID convId, @Param("userId") UUID userId);

    @Query("SELECT COUNT(m) FROM Message m WHERE m.senderId != :userId AND m.read = false AND m.conversationId IN " +
           "(SELECT c.id FROM Conversation c WHERE c.userAId = :userId OR c.userBId = :userId)")
    long countTotalUnread(@Param("userId") UUID userId);

    @Modifying
    @Query("UPDATE Message m SET m.read = true WHERE m.conversationId = :convId AND m.senderId != :userId AND m.read = false")
    void markAllReadInConversation(@Param("convId") UUID convId, @Param("userId") UUID userId);
}
