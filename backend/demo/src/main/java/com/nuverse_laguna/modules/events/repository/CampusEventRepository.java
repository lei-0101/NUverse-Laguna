package com.nuverse_laguna.modules.events.repository;

import com.nuverse_laguna.modules.events.domain.CampusEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.UUID;

public interface CampusEventRepository extends JpaRepository<CampusEvent, UUID>,
        JpaSpecificationExecutor<CampusEvent> {
}
