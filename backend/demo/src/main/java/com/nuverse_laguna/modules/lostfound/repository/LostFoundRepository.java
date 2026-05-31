package com.nuverse_laguna.modules.lostfound.repository;

import com.nuverse_laguna.modules.lostfound.domain.ItemStatus;
import com.nuverse_laguna.modules.lostfound.domain.ItemType;
import com.nuverse_laguna.modules.lostfound.domain.LostFoundItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface LostFoundRepository extends JpaRepository<LostFoundItem, UUID> {

    Page<LostFoundItem> findByTypeAndStatusOrderByCreatedAtDesc(ItemType type, ItemStatus status, Pageable pageable);

    Page<LostFoundItem> findByStatusOrderByCreatedAtDesc(ItemStatus status, Pageable pageable);

    Page<LostFoundItem> findByReporterIdOrderByCreatedAtDesc(UUID reporterId, Pageable pageable);

    @Query("SELECT i FROM LostFoundItem i WHERE i.status = :status " +
           "AND (LOWER(i.title) LIKE LOWER(CONCAT('%', :kw, '%')) " +
           "OR LOWER(i.description) LIKE LOWER(CONCAT('%', :kw, '%'))) " +
           "ORDER BY i.createdAt DESC")
    Page<LostFoundItem> searchByKeyword(@Param("kw") String keyword, @Param("status") ItemStatus status, Pageable pageable);
}
