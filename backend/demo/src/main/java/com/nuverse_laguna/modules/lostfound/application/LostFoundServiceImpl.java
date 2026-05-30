package com.nuverse_laguna.modules.lostfound.application;

import com.nuverse_laguna.modules.lostfound.domain.ItemStatus;
import com.nuverse_laguna.modules.lostfound.domain.ItemType;
import com.nuverse_laguna.modules.lostfound.domain.LostFoundItem;
import com.nuverse_laguna.modules.lostfound.dto.CreateLostFoundRequest;
import com.nuverse_laguna.modules.lostfound.dto.LostFoundItemResponse;
import com.nuverse_laguna.modules.lostfound.repository.LostFoundRepository;
import com.nuverse_laguna.modules.profile.repository.UserProfileRepository;
import com.nuverse_laguna.shared.exception.AppException;
import com.nuverse_laguna.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class LostFoundServiceImpl implements LostFoundService {

    private final LostFoundRepository repository;
    private final UserProfileRepository profileRepository;

    @Override
    public LostFoundItemResponse create(UUID reporterId, CreateLostFoundRequest request) {
        ItemType type;
        try {
            type = ItemType.valueOf(request.type().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Invalid type: must be LOST or FOUND");
        }
        LostFoundItem item = LostFoundItem.create(
                reporterId, type, request.title(), request.description(),
                request.location(), request.itemDate(), request.imageUrl(), request.contact()
        );
        return toResponse(repository.save(item));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<LostFoundItemResponse> browse(String type, String status, Pageable pageable) {
        ItemStatus s = status != null ? ItemStatus.valueOf(status.toUpperCase()) : ItemStatus.OPEN;
        if (type != null) {
            ItemType t = ItemType.valueOf(type.toUpperCase());
            return repository.findByTypeAndStatusOrderByCreatedAtDesc(t, s, pageable).map(this::toResponse);
        }
        return repository.findByStatusOrderByCreatedAtDesc(s, pageable).map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<LostFoundItemResponse> getMine(UUID userId, Pageable pageable) {
        return repository.findByReporterIdOrderByCreatedAtDesc(userId, pageable).map(this::toResponse);
    }

    @Override
    public LostFoundItemResponse resolve(UUID itemId, UUID userId) {
        LostFoundItem item = repository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("LostFoundItem", itemId));
        if (!item.isOwnedBy(userId)) {
            throw new AppException(HttpStatus.FORBIDDEN, "Only the reporter can mark this item as resolved");
        }
        item.resolve();
        return toResponse(repository.save(item));
    }

    private LostFoundItemResponse toResponse(LostFoundItem item) {
        String reporterName = profileRepository.findByUserId(item.getReporterId())
                .map(p -> p.getFullName())
                .orElse("Unknown");
        return new LostFoundItemResponse(
                item.getId(), item.getReporterId(), reporterName,
                item.getType().name(), item.getStatus().name(),
                item.getTitle(), item.getDescription(), item.getLocation(),
                item.getItemDate(), item.getImageUrl(), item.getContact(),
                item.getCreatedAt()
        );
    }
}
