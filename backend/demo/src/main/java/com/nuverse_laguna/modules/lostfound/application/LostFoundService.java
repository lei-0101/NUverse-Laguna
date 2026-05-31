package com.nuverse_laguna.modules.lostfound.application;

import com.nuverse_laguna.modules.lostfound.dto.*;
import com.nuverse_laguna.shared.dto.ReactionSummary;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface LostFoundService {
    UploadImageResponse uploadImage(MultipartFile file);
    LostFoundItemResponse create(UUID reporterId, CreateLostFoundRequest request);
    LostFoundItemResponse update(UUID itemId, UUID userId, UpdateLostFoundRequest request);
    LostFoundItemResponse getById(UUID itemId, UUID currentUserId);
    Page<LostFoundItemResponse> browse(String type, String status, String keyword, Pageable pageable);
    Page<LostFoundItemResponse> getMine(UUID userId, Pageable pageable);
    LostFoundItemResponse resolve(UUID itemId, UUID userId);
    void delete(UUID itemId, UUID userId);
    void adminDelete(UUID itemId);
    LostFoundItemResponse toggleReaction(UUID itemId, UUID userId, String emoji);
    List<ReactionSummary> getReactions(UUID itemId);
    List<LostFoundCommentResponse> getComments(UUID itemId);
    LostFoundCommentResponse addComment(UUID itemId, UUID authorId, String authorName, AddCommentRequest request);
    void deleteComment(UUID commentId, UUID userId);
    void adminDeleteComment(UUID commentId);
}
