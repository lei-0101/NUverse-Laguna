package com.nuverse_laguna.modules.lostfound.repository;

import com.nuverse_laguna.modules.lostfound.domain.LostFoundReaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LostFoundReactionRepository extends JpaRepository<LostFoundReaction, UUID> {
    long countByItemId(UUID itemId);
    List<LostFoundReaction> findAllByItemId(UUID itemId);
    Optional<LostFoundReaction> findByItemIdAndUserId(UUID itemId, UUID userId);
    boolean existsByItemIdAndUserId(UUID itemId, UUID userId);
    void deleteByItemIdAndUserId(UUID itemId, UUID userId);
}
