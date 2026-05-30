package com.nuverse_laguna.modules.chibi.repository;

import com.nuverse_laguna.modules.chibi.domain.ChibiProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ChibiProfileRepository extends JpaRepository<ChibiProfile, UUID> {
    Optional<ChibiProfile> findByUserId(UUID userId);
}
