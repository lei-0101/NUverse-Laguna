package com.nuverse_laguna.modules.announcements.application;

import com.nuverse_laguna.modules.announcements.dto.AnnouncementResponse;
import com.nuverse_laguna.modules.announcements.dto.CreateAnnouncementRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface AnnouncementService {
    AnnouncementResponse create(UUID adminId, CreateAnnouncementRequest request);
    List<AnnouncementResponse> getEffective();
    Page<AnnouncementResponse> getAll(Pageable pageable);
    AnnouncementResponse deactivate(UUID announcementId, UUID adminId);
}
