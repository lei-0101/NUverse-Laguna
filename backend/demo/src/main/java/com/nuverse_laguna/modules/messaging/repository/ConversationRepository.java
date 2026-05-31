package com.nuverse_laguna.modules.messaging.repository;

import com.nuverse_laguna.modules.messaging.domain.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ConversationRepository extends JpaRepository<Conversation, UUID> {

    @Query("SELECT c FROM Conversation c WHERE c.userAId = :userId OR c.userBId = :userId ORDER BY c.updatedAt DESC")
    List<Conversation> findByUserId(@Param("userId") UUID userId);

    @Query("SELECT c FROM Conversation c WHERE (c.userAId = :a AND c.userBId = :b) OR (c.userAId = :b AND c.userBId = :a)")
    Optional<Conversation> findByPair(@Param("a") UUID a, @Param("b") UUID b);
}
