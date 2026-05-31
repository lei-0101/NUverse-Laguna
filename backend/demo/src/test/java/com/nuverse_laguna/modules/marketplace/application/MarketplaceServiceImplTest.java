package com.nuverse_laguna.modules.marketplace.application;

import com.nuverse_laguna.modules.marketplace.domain.ListingCategory;
import com.nuverse_laguna.modules.marketplace.domain.ListingCondition;
import com.nuverse_laguna.modules.marketplace.domain.ListingReport;
import com.nuverse_laguna.modules.marketplace.domain.ListingStatus;
import com.nuverse_laguna.modules.marketplace.domain.MarketplaceListing;
import com.nuverse_laguna.modules.marketplace.domain.SavedListing;
import com.nuverse_laguna.modules.marketplace.dto.CreateListingRequest;
import com.nuverse_laguna.modules.marketplace.dto.ListingResponse;
import com.nuverse_laguna.modules.marketplace.dto.ReportListingRequest;
import com.nuverse_laguna.modules.marketplace.dto.UpdateListingRequest;
import com.nuverse_laguna.modules.marketplace.repository.ListingReportRepository;
import com.nuverse_laguna.modules.marketplace.repository.MarketplaceListingRepository;
import com.nuverse_laguna.modules.marketplace.repository.MarketplaceListingRepository.ListingThumbnailProjection;
import com.nuverse_laguna.modules.marketplace.repository.SavedListingRepository;
import com.nuverse_laguna.modules.notifications.application.NotificationService;
import com.nuverse_laguna.shared.exception.AppException;
import com.nuverse_laguna.shared.exception.ResourceNotFoundException;
import com.nuverse_laguna.shared.profile.ProfileSummary;
import com.nuverse_laguna.shared.profile.UserProfileReader;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.context.ApplicationEventPublisher;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentMatchers;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("MarketplaceServiceImpl")
class MarketplaceServiceImplTest {

    @Mock private MarketplaceListingRepository listingRepository;
    @Mock private SavedListingRepository savedListingRepository;
    @Mock private ListingReportRepository reportRepository;
    @Mock private UserProfileReader userProfileReader;
    @Mock private com.nuverse_laguna.shared.storage.StorageService storageService;
    @Mock private ApplicationEventPublisher eventPublisher;
    @Mock private NotificationService notificationService;

    private MarketplaceServiceImpl service;

    private static final UUID SELLER_ID = UUID.randomUUID();
    private static final UUID OTHER_USER_ID = UUID.randomUUID();
    private static final UUID LISTING_ID = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        service = new MarketplaceServiceImpl(
                listingRepository, savedListingRepository, reportRepository,
                userProfileReader, storageService, eventPublisher, notificationService
        );
    }

    // ─── createListing ────────────────────────────────────────────────────────

    @Test
    @DisplayName("createListing: valid request saves listing and returns AVAILABLE response")
    void createListing_validRequest_returnsAvailableResponse() {
        CreateListingRequest request = new CreateListingRequest(
                "Old Textbook", "Good condition", BigDecimal.valueOf(150),
                ListingCategory.BOOKS, ListingCondition.GOOD, null
        );
        ProfileSummary sellerProfile = new ProfileSummary(SELLER_ID, "Juan", null);

        when(listingRepository.save(any(MarketplaceListing.class)))
                .thenAnswer(inv -> inv.getArgument(0));
        when(userProfileReader.findProfileSummary(SELLER_ID))
                .thenReturn(Optional.of(sellerProfile));

        ListingResponse response = service.createListing(SELLER_ID, request);

        assertThat(response.title()).isEqualTo("Old Textbook");
        assertThat(response.status()).isEqualTo("AVAILABLE");
        verify(listingRepository).save(any(MarketplaceListing.class));
    }

    @Test
    @DisplayName("createListing: with images attaches them to the listing")
    void createListing_withImages_attachesImages() {
        List<String> imageUrls = List.of("http://img1.jpg", "http://img2.jpg");
        CreateListingRequest request = new CreateListingRequest(
                "Laptop", "Working condition", BigDecimal.valueOf(3000),
                ListingCategory.GADGETS, ListingCondition.LIKE_NEW, imageUrls
        );
        ProfileSummary sellerProfile = new ProfileSummary(SELLER_ID, "Juan", null);

        when(listingRepository.save(any(MarketplaceListing.class)))
                .thenAnswer(inv -> inv.getArgument(0));
        when(userProfileReader.findProfileSummary(SELLER_ID))
                .thenReturn(Optional.of(sellerProfile));

        ListingResponse response = service.createListing(SELLER_ID, request);

        assertThat(response.imageUrls()).hasSize(2);
    }

    // ─── getListing ───────────────────────────────────────────────────────────

    @Test
    @DisplayName("getListing: found listing returns detail response")
    void getListing_found_returnsResponse() {
        MarketplaceListing listing = buildListing();
        ProfileSummary sellerProfile = new ProfileSummary(SELLER_ID, "Juan", null);

        when(listingRepository.findByIdWithImages(LISTING_ID)).thenReturn(Optional.of(listing));
        when(savedListingRepository.existsByUserIdAndListingId(SELLER_ID, LISTING_ID)).thenReturn(false);
        when(userProfileReader.findProfileSummary(SELLER_ID)).thenReturn(Optional.of(sellerProfile));

        ListingResponse response = service.getListing(LISTING_ID, SELLER_ID);

        assertThat(response.title()).isEqualTo("Test Listing");
        assertThat(response.isSaved()).isFalse();
    }

    @Test
    @DisplayName("getListing: marks isSaved=true when viewer has saved the listing")
    void getListing_alreadySaved_isSavedTrue() {
        MarketplaceListing listing = buildListing();
        ProfileSummary sellerProfile = new ProfileSummary(SELLER_ID, "Juan", null);

        when(listingRepository.findByIdWithImages(LISTING_ID)).thenReturn(Optional.of(listing));
        when(savedListingRepository.existsByUserIdAndListingId(OTHER_USER_ID, LISTING_ID)).thenReturn(true);
        when(userProfileReader.findProfileSummary(SELLER_ID)).thenReturn(Optional.of(sellerProfile));

        ListingResponse response = service.getListing(LISTING_ID, OTHER_USER_ID);

        assertThat(response.isSaved()).isTrue();
    }

    @Test
    @DisplayName("getListing: not found throws ResourceNotFoundException")
    void getListing_notFound_throwsNotFoundException() {
        when(listingRepository.findByIdWithImages(LISTING_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getListing(LISTING_ID, SELLER_ID))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ─── updateListing ────────────────────────────────────────────────────────

    @Test
    @DisplayName("updateListing: owner updates available listing successfully")
    void updateListing_owner_updatesSuccessfully() {
        MarketplaceListing listing = buildListing();
        UpdateListingRequest request = new UpdateListingRequest(
                "Updated Title", "Updated desc", BigDecimal.valueOf(200),
                ListingCategory.GADGETS, ListingCondition.LIKE_NEW, null
        );
        ProfileSummary sellerProfile = new ProfileSummary(SELLER_ID, "Juan", null);

        when(listingRepository.findById(LISTING_ID)).thenReturn(Optional.of(listing));
        when(listingRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(userProfileReader.findProfileSummary(SELLER_ID)).thenReturn(Optional.of(sellerProfile));

        ListingResponse response = service.updateListing(SELLER_ID, LISTING_ID, request);

        assertThat(response.title()).isEqualTo("Updated Title");
        assertThat(response.category()).isEqualTo("GADGETS");
    }

    @Test
    @DisplayName("updateListing: non-owner gets 403 Forbidden")
    void updateListing_nonOwner_throwsForbidden() {
        MarketplaceListing listing = buildListing();
        UpdateListingRequest request = new UpdateListingRequest(
                "Title", "Desc", BigDecimal.valueOf(100),
                ListingCategory.BOOKS, ListingCondition.GOOD, null
        );

        when(listingRepository.findById(LISTING_ID)).thenReturn(Optional.of(listing));

        assertThatThrownBy(() -> service.updateListing(OTHER_USER_ID, LISTING_ID, request))
                .isInstanceOf(AppException.class)
                .satisfies(ex -> assertThat(((AppException) ex).getStatus()).isEqualTo(HttpStatus.FORBIDDEN));
    }

    @Test
    @DisplayName("updateListing: sold listing cannot be edited — domain invariant enforced")
    void updateListing_soldListing_throwsBadRequest() {
        MarketplaceListing listing = buildListing();
        listing.markAsSold();
        UpdateListingRequest request = new UpdateListingRequest(
                "Title", "Desc", BigDecimal.valueOf(100),
                ListingCategory.BOOKS, ListingCondition.GOOD, null
        );

        when(listingRepository.findById(LISTING_ID)).thenReturn(Optional.of(listing));

        assertThatThrownBy(() -> service.updateListing(SELLER_ID, LISTING_ID, request))
                .isInstanceOf(AppException.class)
                .satisfies(ex -> assertThat(((AppException) ex).getStatus()).isEqualTo(HttpStatus.BAD_REQUEST));
    }

    // ─── markAsSold ───────────────────────────────────────────────────────────

    @Test
    @DisplayName("markAsSold: owner marks available listing as SOLD")
    void markAsSold_owner_marksAsSold() {
        MarketplaceListing listing = buildListing();
        ProfileSummary sellerProfile = new ProfileSummary(SELLER_ID, "Juan", null);

        when(listingRepository.findById(LISTING_ID)).thenReturn(Optional.of(listing));
        when(listingRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(userProfileReader.findProfileSummary(SELLER_ID)).thenReturn(Optional.of(sellerProfile));

        ListingResponse response = service.markAsSold(SELLER_ID, LISTING_ID);

        assertThat(response.status()).isEqualTo("SOLD");
        assertThat(listing.getStatus()).isEqualTo(ListingStatus.SOLD);
    }

    @Test
    @DisplayName("markAsSold: non-owner gets 403")
    void markAsSold_nonOwner_throwsForbidden() {
        MarketplaceListing listing = buildListing();
        when(listingRepository.findById(LISTING_ID)).thenReturn(Optional.of(listing));

        assertThatThrownBy(() -> service.markAsSold(OTHER_USER_ID, LISTING_ID))
                .isInstanceOf(AppException.class)
                .satisfies(ex -> assertThat(((AppException) ex).getStatus()).isEqualTo(HttpStatus.FORBIDDEN));
    }

    @Test
    @DisplayName("markAsSold: already sold listing throws 400 — domain invariant")
    void markAsSold_alreadySold_throwsBadRequest() {
        MarketplaceListing listing = buildListing();
        listing.markAsSold();

        when(listingRepository.findById(LISTING_ID)).thenReturn(Optional.of(listing));

        assertThatThrownBy(() -> service.markAsSold(SELLER_ID, LISTING_ID))
                .isInstanceOf(AppException.class)
                .satisfies(ex -> assertThat(((AppException) ex).getStatus()).isEqualTo(HttpStatus.BAD_REQUEST));
    }

    // ─── removeListing ────────────────────────────────────────────────────────

    @Test
    @DisplayName("removeListing: owner soft-deletes listing (status = REMOVED)")
    void removeListing_owner_setsStatusRemoved() {
        MarketplaceListing listing = buildListing();

        when(listingRepository.findById(LISTING_ID)).thenReturn(Optional.of(listing));
        when(listingRepository.save(any())).thenReturn(listing);

        service.removeListing(SELLER_ID, LISTING_ID);

        assertThat(listing.getStatus()).isEqualTo(ListingStatus.REMOVED);
        verify(listingRepository).save(listing);
    }

    @Test
    @DisplayName("removeListing: non-owner gets 403")
    void removeListing_nonOwner_throwsForbidden() {
        MarketplaceListing listing = buildListing();
        when(listingRepository.findById(LISTING_ID)).thenReturn(Optional.of(listing));

        assertThatThrownBy(() -> service.removeListing(OTHER_USER_ID, LISTING_ID))
                .isInstanceOf(AppException.class)
                .satisfies(ex -> assertThat(((AppException) ex).getStatus()).isEqualTo(HttpStatus.FORBIDDEN));
    }

    // ─── saveListing ──────────────────────────────────────────────────────────

    @Test
    @DisplayName("saveListing: persists SavedListing when not already saved")
    void saveListing_notAlreadySaved_saves() {
        when(listingRepository.existsById(LISTING_ID)).thenReturn(true);
        when(savedListingRepository.existsByUserIdAndListingId(SELLER_ID, LISTING_ID)).thenReturn(false);

        service.saveListing(SELLER_ID, LISTING_ID);

        verify(savedListingRepository).save(any(SavedListing.class));
    }

    @Test
    @DisplayName("saveListing: listing not found throws ResourceNotFoundException")
    void saveListing_listingNotFound_throwsNotFoundException() {
        when(listingRepository.existsById(LISTING_ID)).thenReturn(false);

        assertThatThrownBy(() -> service.saveListing(SELLER_ID, LISTING_ID))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(savedListingRepository, never()).save(any());
    }

    @Test
    @DisplayName("saveListing: already saved throws 409 Conflict")
    void saveListing_alreadySaved_throwsConflict() {
        when(listingRepository.existsById(LISTING_ID)).thenReturn(true);
        when(savedListingRepository.existsByUserIdAndListingId(SELLER_ID, LISTING_ID)).thenReturn(true);

        assertThatThrownBy(() -> service.saveListing(SELLER_ID, LISTING_ID))
                .isInstanceOf(AppException.class)
                .satisfies(ex -> assertThat(((AppException) ex).getStatus()).isEqualTo(HttpStatus.CONFLICT));

        verify(savedListingRepository, never()).save(any());
    }

    // ─── unsaveListing ────────────────────────────────────────────────────────

    @Test
    @DisplayName("unsaveListing: deletes saved listing when it exists")
    void unsaveListing_saved_deletes() {
        when(savedListingRepository.existsByUserIdAndListingId(SELLER_ID, LISTING_ID)).thenReturn(true);

        service.unsaveListing(SELLER_ID, LISTING_ID);

        verify(savedListingRepository).deleteByUserIdAndListingId(SELLER_ID, LISTING_ID);
    }

    @Test
    @DisplayName("unsaveListing: not in saved list throws 404")
    void unsaveListing_notSaved_throwsNotFound() {
        when(savedListingRepository.existsByUserIdAndListingId(SELLER_ID, LISTING_ID)).thenReturn(false);

        assertThatThrownBy(() -> service.unsaveListing(SELLER_ID, LISTING_ID))
                .isInstanceOf(AppException.class)
                .satisfies(ex -> assertThat(((AppException) ex).getStatus()).isEqualTo(HttpStatus.NOT_FOUND));

        verify(savedListingRepository, never()).deleteByUserIdAndListingId(any(), any());
    }

    // ─── reportListing ────────────────────────────────────────────────────────

    @Test
    @DisplayName("reportListing: valid report is persisted")
    void reportListing_valid_savesReport() {
        ReportListingRequest request = new ReportListingRequest("Spam content");

        when(listingRepository.existsById(LISTING_ID)).thenReturn(true);
        when(reportRepository.existsByReporterIdAndListingId(OTHER_USER_ID, LISTING_ID)).thenReturn(false);

        service.reportListing(OTHER_USER_ID, LISTING_ID, request);

        verify(reportRepository).save(any(ListingReport.class));
    }

    @Test
    @DisplayName("reportListing: listing not found throws ResourceNotFoundException")
    void reportListing_listingNotFound_throwsNotFoundException() {
        when(listingRepository.existsById(LISTING_ID)).thenReturn(false);

        assertThatThrownBy(() -> service.reportListing(OTHER_USER_ID, LISTING_ID, new ReportListingRequest("Spam")))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(reportRepository, never()).save(any());
    }

    @Test
    @DisplayName("reportListing: duplicate report throws 409 Conflict")
    void reportListing_alreadyReported_throwsConflict() {
        when(listingRepository.existsById(LISTING_ID)).thenReturn(true);
        when(reportRepository.existsByReporterIdAndListingId(OTHER_USER_ID, LISTING_ID)).thenReturn(true);

        assertThatThrownBy(() -> service.reportListing(OTHER_USER_ID, LISTING_ID, new ReportListingRequest("Spam")))
                .isInstanceOf(AppException.class)
                .satisfies(ex -> assertThat(((AppException) ex).getStatus()).isEqualTo(HttpStatus.CONFLICT));

        verify(reportRepository, never()).save(any());
    }

    // ─── suspendListing ───────────────────────────────────────────────────────

    @Test
    @DisplayName("suspendListing: sets status to SUSPENDED")
    void suspendListing_setsStatusSuspended() {
        MarketplaceListing listing = buildListing();
        ProfileSummary sellerProfile = new ProfileSummary(SELLER_ID, "Juan", null);

        when(listingRepository.findById(LISTING_ID)).thenReturn(Optional.of(listing));
        when(listingRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(userProfileReader.findProfileSummary(SELLER_ID)).thenReturn(Optional.of(sellerProfile));

        ListingResponse response = service.suspendListing(LISTING_ID);

        assertThat(response.status()).isEqualTo("SUSPENDED");
        assertThat(listing.getStatus()).isEqualTo(ListingStatus.SUSPENDED);
    }

    // ─── uploadImage ──────────────────────────────────────────────────────────

    @Test
    @DisplayName("uploadImage: delegates to storage under the 'listings' category and returns the URL")
    void uploadImage_delegatesToStorage_returnsUrl() {
        MultipartFile file = mock(MultipartFile.class);
        when(storageService.store(file, "listings")).thenReturn("/uploads/listings/abc.png");

        var response = service.uploadImage(file);

        assertThat(response.url()).isEqualTo("/uploads/listings/abc.png");
        verify(storageService).store(file, "listings");
    }

    // ─── getListings (thumbnail mapping) ────────────────────────────────────────

    @Test
    @DisplayName("getListings: maps each card's primary image into thumbnailUrl without N+1")
    void getListings_mapsPrimaryImageIntoThumbnail() {
        MarketplaceListing listing = buildListing();
        Page<MarketplaceListing> page = new PageImpl<>(List.of(listing));

        when(listingRepository.findAll(ArgumentMatchers.<Specification<MarketplaceListing>>any(),
                any(Pageable.class))).thenReturn(page);
        when(userProfileReader.findProfileSummaries(anyList()))
                .thenReturn(Map.of(SELLER_ID, new ProfileSummary(SELLER_ID, "Juan", null)));
        ListingThumbnailProjection projection = mock(ListingThumbnailProjection.class);
        when(projection.getListingId()).thenReturn(listing.getId());
        when(projection.getImageUrl()).thenReturn("/uploads/listings/thumb.png");
        when(listingRepository.findPrimaryImages(anyList())).thenReturn(List.of(projection));

        var result = service.getListings(null, null, null, null, null, PageRequest.of(0, 12));

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().getFirst().thumbnailUrl()).isEqualTo("/uploads/listings/thumb.png");
    }

    @Test
    @DisplayName("getListings: listing with no images yields a null thumbnailUrl")
    void getListings_noImages_nullThumbnail() {
        MarketplaceListing listing = buildListing();
        Page<MarketplaceListing> page = new PageImpl<>(List.of(listing));

        when(listingRepository.findAll(ArgumentMatchers.<Specification<MarketplaceListing>>any(),
                any(Pageable.class))).thenReturn(page);
        when(userProfileReader.findProfileSummaries(anyList()))
                .thenReturn(Map.of(SELLER_ID, new ProfileSummary(SELLER_ID, "Juan", null)));
        when(listingRepository.findPrimaryImages(anyList())).thenReturn(List.of());

        var result = service.getListings(null, null, null, null, null, PageRequest.of(0, 12));

        assertThat(result.getContent().getFirst().thumbnailUrl()).isNull();
    }

    // ─── helpers ──────────────────────────────────────────────────────────────

    private MarketplaceListing buildListing() {
        return MarketplaceListing.create(
                SELLER_ID, "Test Listing", "A good item",
                BigDecimal.valueOf(100), ListingCategory.BOOKS, ListingCondition.GOOD
        );
    }
}
