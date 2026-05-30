package com.nuverse_laguna.modules.announcements.application;

import com.nuverse_laguna.modules.announcements.domain.AnnouncementPriority;
import com.nuverse_laguna.modules.announcements.domain.EmergencyAnnouncement;
import com.nuverse_laguna.modules.announcements.dto.AnnouncementResponse;
import com.nuverse_laguna.modules.announcements.dto.CreateAnnouncementRequest;
import com.nuverse_laguna.modules.announcements.repository.AnnouncementRepository;
import com.nuverse_laguna.shared.exception.AppException;
import com.nuverse_laguna.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class AnnouncementServiceImpl implements AnnouncementService {

    private final AnnouncementRepository repository;

    @Override
    public AnnouncementResponse create(UUID adminId, CreateAnnouncementRequest request) {
        AnnouncementPriority priority;
        try {
            priority = AnnouncementPriority.valueOf(request.priority().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Invalid priority: " + request.priority());
        }

        EmergencyAnnouncement a = EmergencyAnnouncement.create(
                request.title(), request.body(), priority, adminId, request.expiresAt());
        return toResponse(repository.save(a));
    }

    @Override
    @Transactional(readOnly = true)
    public List<AnnouncementResponse> getEffective() {
        return repository.findEffective(LocalDateTime.now()).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AnnouncementResponse> getAll(Pageable pageable) {
        return repository.findAllByOrderByCreatedAtDesc(pageable).map(this::toResponse);
    }

    @Override
    public AnnouncementResponse deactivate(UUID announcementId, UUID adminId) {
        EmergencyAnnouncement a = repository.findById(announcementId)
                .orElseThrow(() -> new ResourceNotFoundException("Announcement", announcementId));
        a.deactivate();
        return toResponse(repository.save(a));
    }

    private AnnouncementResponse toResponse(EmergencyAnnouncement a) {
        return new AnnouncementResponse(
                a.getId(), a.getTitle(), a.getBody(), a.getPriority().name(),
                a.getCreatedBy(), a.isActive(), a.getExpiresAt(), a.getCreatedAt()
        );
    }
}
