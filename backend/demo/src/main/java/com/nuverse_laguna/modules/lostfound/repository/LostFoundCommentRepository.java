package com.nuverse_laguna.modules.lostfound.repository;

import com.nuverse_laguna.modules.lostfound.domain.LostFoundComment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface LostFoundCommentRepository extends JpaRepository<LostFoundComment, UUID> {
    List<LostFoundComment> findByItemIdOrderByCreatedAtAsc(UUID itemId);
    void deleteByItemId(UUID itemId);
}
