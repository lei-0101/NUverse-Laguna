package com.nuverse_laguna.modules.chibi.repository;

import com.nuverse_laguna.modules.chibi.domain.ChibiXpEvent;
import com.nuverse_laguna.modules.chibi.domain.XpSource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.UUID;

public interface ChibiXpEventRepository extends JpaRepository<ChibiXpEvent, UUID> {
    Page<ChibiXpEvent> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);
    boolean existsByUserIdAndSourceAndCreatedAtAfter(UUID userId, XpSource source, LocalDateTime since);
}
