package com.nuverse_laguna.modules.chibi.repository;

import com.nuverse_laguna.modules.chibi.domain.ChibiXpEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ChibiXpEventRepository extends JpaRepository<ChibiXpEvent, UUID> {
    Page<ChibiXpEvent> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);
}
