package com.nuverse_laguna.modules.marketplace.application;

import com.nuverse_laguna.modules.marketplace.domain.ListingCategory;
import com.nuverse_laguna.modules.marketplace.domain.ListingCondition;
import com.nuverse_laguna.modules.marketplace.domain.ListingReport;
import com.nuverse_laguna.modules.marketplace.domain.MarketplaceListing;
import com.nuverse_laguna.modules.marketplace.domain.SavedListing;
import com.nuverse_laguna.modules.marketplace.dto.CreateListingRequest;
import com.nuverse_laguna.modules.marketplace.dto.ListingCardResponse;
import com.nuverse_laguna.modules.marketplace.dto.ListingResponse;
import com.nuverse_laguna.modules.marketplace.dto.ReportListingRequest;
import com.nuverse_laguna.modules.marketplace.dto.UpdateListingRequest;
import com.nuverse_laguna.modules.marketplace.dto.UploadImageResponse;
import com.nuverse_laguna.modules.marketplace.repository.ListingReportRepository;
import com.nuverse_laguna.modules.marketplace.repository.ListingSpecification;
import com.nuverse_laguna.modules.marketplace.repository.MarketplaceListingRepository;
import com.nuverse_laguna.modules.marketplace.repository.SavedListingRepository;
import com.nuverse_laguna.modules.notifications.application.NotificationService;
import com.nuverse_laguna.modules.notifications.domain.NotificationType;
import com.nuverse_laguna.modules.notifications.domain.ReferenceType;
import com.nuverse_laguna.shared.event.MarketplaceListingCreatedEvent;
import com.nuverse_laguna.shared.event.MarketplaceListingSoldEvent;
import com.nuverse_laguna.shared.exception.AppException;
import com.nuverse_laguna.shared.exception.ResourceNotFoundException;
import com.nuverse_laguna.shared.profile.ProfileSummary;
import com.nuverse_laguna.shared.profile.UserProfileReader;
import com.nuverse_laguna.shared.storage.StorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class MarketplaceServiceImpl implements MarketplaceService {

    private static final String LISTING_IMAGE_CATEGORY = "listings";

    private final MarketplaceListingRepository listingRepository;
    private final SavedListingRepository savedListingRepository;
    private final ListingReportRepository reportRepository;
    private final UserProfileReader userProfileReader;
    private final StorageService storageService;
    private final ApplicationEventPublisher eventPublisher;
    private final NotificationService notificationService;

    // ── Image upload ───────────────────────────────────────────────────────────

    @Override
    public UploadImageResponse uploadImage(MultipartFile file) {
        String url = storageService.store(file, LISTING_IMAGE_CATEGORY);
        return new UploadImageResponse(url);
    }

    // ── Create ───────────────────────────────────────────────────────────────

    @Override
    public ListingResponse createListing(UUID sellerId, CreateListingRequest request) {
        MarketplaceListing listing = MarketplaceListing.create(
                sellerId,
                request.title(),
                request.description(),
                request.price(),
                request.category(),
                request.condition()
        );
        if (request.imageUrls() != null) {
            request.imageUrls().forEach(url -> listing.addImage(url, listing.getImages().size()));
        }
        MarketplaceListing saved = listingRepository.save(listing);
        log.info("Listing created: {} by seller {}", saved.getId(), sellerId);
        eventPublisher.publishEvent(new MarketplaceListingCreatedEvent(sellerId, saved.getId(), saved.getTitle()));
        return toDetailResponse(saved, sellerId, false);
    }

    // ── Read ─────────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public Page<ListingCardResponse> getListings(String keyword, ListingCategory category,
                                                  ListingCondition condition, BigDecimal minPrice,
                                                  BigDecimal maxPrice, Pageable pageable) {
        Specification<MarketplaceListing> spec = ListingSpecification.build(
                keyword, category, condition, minPrice, maxPrice
        );
        Page<MarketplaceListing> page = listingRepository.findAll(spec, pageable);
        Map<UUID, ProfileSummary> sellerMap = loadSellerMap(page.getContent());
        Map<UUID, String> thumbnailMap = loadThumbnailMap(page.getContent());
        return page.map(listing -> toCardResponse(listing, sellerMap, thumbnailMap));
    }

    @Override
    @Transactional(readOnly = true)
    public ListingResponse getListing(UUID listingId, UUID viewerId) {
        MarketplaceListing listing = listingRepository.findByIdWithImages(listingId)
                .orElseThrow(() -> new ResourceNotFoundException("Listing", listingId));
        boolean isSaved = savedListingRepository.existsByUserIdAndListingId(viewerId, listingId);
        return toDetailResponse(listing, viewerId, isSaved);
    }

    // ── Update ───────────────────────────────────────────────────────────────

    @Override
    public ListingResponse updateListing(UUID userId, UUID listingId, UpdateListingRequest request) {
        MarketplaceListing listing = findListingById(listingId);
        requireOwnership(listing, userId);
        listing.updateDetails(
                request.title(), request.description(), request.price(),
                request.category(), request.condition()
        );
        if (request.imageUrls() != null) {
            listing.replaceImages(request.imageUrls());
        }
        return toDetailResponse(listingRepository.save(listing), userId, false);
    }

    @Override
    public ListingResponse markAsSold(UUID userId, UUID listingId) {
        MarketplaceListing listing = findListingById(listingId);
        requireOwnership(listing, userId);
        listing.markAsSold();
        ListingResponse response = toDetailResponse(listingRepository.save(listing), userId, false);
        eventPublisher.publishEvent(new MarketplaceListingSoldEvent(userId, listingId, listing.getTitle()));
        return response;
    }

    // ── Delete / Moderation ───────────────────────────────────────────────────

    @Override
    public void removeListing(UUID userId, UUID listingId) {
        MarketplaceListing listing = findListingById(listingId);
        requireOwnership(listing, userId);
        listing.remove();
        listingRepository.save(listing);
        log.info("Listing {} removed by owner {}", listingId, userId);
    }

    @Override
    public ListingResponse suspendListing(UUID listingId) {
        MarketplaceListing listing = findListingById(listingId);
        listing.suspend();
        log.info("Listing {} suspended by admin", listingId);
        return toDetailResponse(listingRepository.save(listing), null, false);
    }

    // ── Save / Unsave ─────────────────────────────────────────────────────────

    @Override
    public void saveListing(UUID userId, UUID listingId) {
        if (!listingRepository.existsById(listingId)) {
            throw new ResourceNotFoundException("Listing", listingId);
        }
        if (savedListingRepository.existsByUserIdAndListingId(userId, listingId)) {
            throw new AppException(HttpStatus.CONFLICT, "Listing is already saved");
        }
        savedListingRepository.save(SavedListing.create(userId, listingId));
    }

    @Override
    public void unsaveListing(UUID userId, UUID listingId) {
        if (!savedListingRepository.existsByUserIdAndListingId(userId, listingId)) {
            throw new AppException(HttpStatus.NOT_FOUND, "Listing is not in your saved list");
        }
        savedListingRepository.deleteByUserIdAndListingId(userId, listingId);
    }

    // ── User-scoped lists ─────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public Page<ListingCardResponse> getSavedListings(UUID userId, Pageable pageable) {
        Page<MarketplaceListing> page = listingRepository.findSavedListings(userId, pageable);
        Map<UUID, ProfileSummary> sellerMap = loadSellerMap(page.getContent());
        Map<UUID, String> thumbnailMap = loadThumbnailMap(page.getContent());
        return page.map(listing -> toCardResponse(listing, sellerMap, thumbnailMap));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ListingCardResponse> getMyListings(UUID userId, Pageable pageable) {
        Page<MarketplaceListing> page = listingRepository.findBySellerId(userId, pageable);
        ProfileSummary seller = userProfileReader.findProfileSummary(userId)
                .orElse(new ProfileSummary(userId, "Unknown User", null));
        Map<UUID, String> thumbnailMap = loadThumbnailMap(page.getContent());
        return page.map(listing ->
                toCardResponse(listing, Collections.singletonMap(userId, seller), thumbnailMap));
    }

    // ── Reports ───────────────────────────────────────────────────────────────

    @Override
    public void reportListing(UUID reporterId, UUID listingId, ReportListingRequest request) {
        if (!listingRepository.existsById(listingId)) {
            throw new ResourceNotFoundException("Listing", listingId);
        }
        if (reportRepository.existsByReporterIdAndListingId(reporterId, listingId)) {
            throw new AppException(HttpStatus.CONFLICT, "You have already reported this listing");
        }
        reportRepository.save(ListingReport.create(reporterId, listingId, request.reason()));
        log.info("Listing {} reported by user {}", listingId, reporterId);
    }

    // ── Messaging ─────────────────────────────────────────────────────────────

    @Override
    public void messageSeller(UUID buyerId, UUID listingId, String message) {
        MarketplaceListing listing = findListingById(listingId);
        if (listing.isOwnedBy(buyerId)) {
            throw new AppException(HttpStatus.BAD_REQUEST, "You cannot message yourself");
        }
        String buyerName = userProfileReader.findProfileSummary(buyerId)
                .map(ProfileSummary::fullName)
                .orElse("A student");
        String body = buyerName + " is interested in your listing \"" + listing.getTitle() + "\": " + message;
        notificationService.create(
                listing.getSellerId(),
                NotificationType.MARKETPLACE_MESSAGE,
                "New message about your listing",
                body,
                listingId,
                ReferenceType.LISTING
        );
        log.info("Message sent from {} to seller of listing {}", buyerId, listingId);
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private MarketplaceListing findListingById(UUID listingId) {
        return listingRepository.findById(listingId)
                .orElseThrow(() -> new ResourceNotFoundException("Listing", listingId));
    }

    private void requireOwnership(MarketplaceListing listing, UUID userId) {
        if (!listing.isOwnedBy(userId)) {
            throw new AppException(HttpStatus.FORBIDDEN, "You do not own this listing");
        }
    }

    private Map<UUID, ProfileSummary> loadSellerMap(List<MarketplaceListing> listings) {
        List<UUID> sellerIds = listings.stream()
                .map(MarketplaceListing::getSellerId)
                .distinct()
                .toList();
        return userProfileReader.findProfileSummaries(sellerIds);
    }

    // One extra query for all the cards' primary images, keyed by listing id —
    // avoids an N+1 over the lazy images collection when rendering grids.
    private Map<UUID, String> loadThumbnailMap(List<MarketplaceListing> listings) {
        if (listings.isEmpty()) {
            return Collections.emptyMap();
        }
        List<UUID> listingIds = listings.stream().map(MarketplaceListing::getId).toList();
        return listingRepository.findPrimaryImages(listingIds).stream()
                .collect(Collectors.toMap(
                        MarketplaceListingRepository.ListingThumbnailProjection::getListingId,
                        MarketplaceListingRepository.ListingThumbnailProjection::getImageUrl
                ));
    }

    private ListingCardResponse toCardResponse(MarketplaceListing listing,
                                                Map<UUID, ProfileSummary> sellerMap,
                                                Map<UUID, String> thumbnailMap) {
        ProfileSummary seller = sellerMap.getOrDefault(
                listing.getSellerId(),
                new ProfileSummary(listing.getSellerId(), "Unknown User", null)
        );
        return new ListingCardResponse(
                listing.getId(),
                listing.getTitle(),
                listing.getPrice(),
                listing.getCategory().name(),
                listing.getCondition().name(),
                listing.getStatus().name(),
                thumbnailMap.get(listing.getId()),
                seller,
                listing.getCreatedAt()
        );
    }

    private ListingResponse toDetailResponse(MarketplaceListing listing, UUID viewerId, boolean isSaved) {
        ProfileSummary seller = userProfileReader.findProfileSummary(listing.getSellerId())
                .orElse(new ProfileSummary(listing.getSellerId(), "Unknown User", null));
        List<String> imageUrls = listing.getImages().stream()
                .map(img -> img.getImageUrl())
                .toList();
        return new ListingResponse(
                listing.getId(),
                listing.getTitle(),
                listing.getDescription(),
                listing.getPrice(),
                listing.getCategory().name(),
                listing.getCondition().name(),
                listing.getStatus().name(),
                imageUrls,
                seller,
                isSaved,
                listing.getCreatedAt(),
                listing.getUpdatedAt()
        );
    }
}
