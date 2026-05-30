package com.nuverse_laguna.modules.lostfound.application;

import com.nuverse_laguna.modules.lostfound.dto.CreateLostFoundRequest;
import com.nuverse_laguna.modules.lostfound.dto.LostFoundItemResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface LostFoundService {
    LostFoundItemResponse create(UUID reporterId, CreateLostFoundRequest request);
    Page<LostFoundItemResponse> browse(String type, String status, Pageable pageable);
    Page<LostFoundItemResponse> getMine(UUID userId, Pageable pageable);
    LostFoundItemResponse resolve(UUID itemId, UUID userId);
}
