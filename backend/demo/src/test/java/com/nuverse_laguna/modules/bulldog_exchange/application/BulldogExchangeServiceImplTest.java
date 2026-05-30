package com.nuverse_laguna.modules.bulldog_exchange.application;

import com.nuverse_laguna.modules.bulldog_exchange.domain.*;
import com.nuverse_laguna.modules.bulldog_exchange.dto.*;
import com.nuverse_laguna.modules.bulldog_exchange.repository.MerchandiseProductRepository;
import com.nuverse_laguna.modules.bulldog_exchange.repository.ProductVariantRepository;
import com.nuverse_laguna.modules.bulldog_exchange.repository.ReservationRepository;
import com.nuverse_laguna.shared.exception.AppException;
import com.nuverse_laguna.shared.exception.ResourceNotFoundException;
import com.nuverse_laguna.shared.storage.StorageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@DisplayName("BulldogExchangeServiceImpl")
class BulldogExchangeServiceImplTest {

    @Mock private MerchandiseProductRepository productRepository;
    @Mock private ProductVariantRepository variantRepository;
    @Mock private ReservationRepository reservationRepository;
    @Mock private ApplicationEventPublisher eventPublisher;
    @Mock private StorageService storageService;

    private BulldogExchangeServiceImpl service;

    static final UUID STUDENT_ID = UUID.randomUUID();
    static final UUID VARIANT_ID = UUID.randomUUID();
    static final UUID RESERVATION_ID = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        service = new BulldogExchangeServiceImpl(
                productRepository, variantRepository, reservationRepository, eventPublisher, storageService
        );
    }

    // ─── createProduct ────────────────────────────────────────────────────────

    @Test
    @DisplayName("createProduct: saves product and returns response")
    void createProduct_savesAndReturnsResponse() {
        CreateProductRequest request = new CreateProductRequest(
                "NU Shirt", "Official shirt", "http://img.jpg", MerchandiseCategory.CLOTHING
        );
        when(productRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        ProductResponse response = service.createProduct(request);

        assertThat(response.name()).isEqualTo("NU Shirt");
        assertThat(response.active()).isTrue();
        verify(productRepository).save(any(MerchandiseProduct.class));
    }

    // ─── getProduct ───────────────────────────────────────────────────────────

    @Test
    @DisplayName("getProduct: found returns detail response with variants")
    void getProduct_found_returnsDetailResponse() {
        MerchandiseProduct product = buildProduct();
        UUID productId = product.getId();

        when(productRepository.findByIdWithVariants(productId)).thenReturn(Optional.of(product));

        ProductResponse response = service.getProduct(productId);

        assertThat(response.name()).isEqualTo("NU Shirt");
    }

    @Test
    @DisplayName("getProduct: not found throws ResourceNotFoundException")
    void getProduct_notFound_throwsNotFoundException() {
        UUID id = UUID.randomUUID();
        when(productRepository.findByIdWithVariants(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getProduct(id))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ─── addVariant ───────────────────────────────────────────────────────────

    @Test
    @DisplayName("addVariant: adds variant and returns updated product")
    void addVariant_validRequest_addsVariant() {
        MerchandiseProduct product = buildProduct();
        UUID productId = product.getId();
        AddVariantRequest request = new AddVariantRequest("M", "Blue", "SKU-M-BLUE", 10, BigDecimal.valueOf(299));

        when(productRepository.findByIdWithVariants(productId)).thenReturn(Optional.of(product));
        when(variantRepository.existsBySku("SKU-M-BLUE")).thenReturn(false);
        when(variantRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(productRepository.findByIdWithVariants(productId)).thenReturn(Optional.of(product));

        service.addVariant(productId, request);

        verify(variantRepository).save(any(ProductVariant.class));
    }

    @Test
    @DisplayName("addVariant: duplicate SKU throws 409 Conflict")
    void addVariant_duplicateSku_throwsConflict() {
        MerchandiseProduct product = buildProduct();
        UUID productId = product.getId();
        AddVariantRequest request = new AddVariantRequest("M", "Blue", "EXISTING-SKU", 5, BigDecimal.valueOf(200));

        when(productRepository.findByIdWithVariants(productId)).thenReturn(Optional.of(product));
        when(variantRepository.existsBySku("EXISTING-SKU")).thenReturn(true);

        assertThatThrownBy(() -> service.addVariant(productId, request))
                .isInstanceOf(AppException.class)
                .satisfies(ex -> assertThat(((AppException) ex).getStatus()).isEqualTo(HttpStatus.CONFLICT));

        verify(variantRepository, never()).save(any());
    }

    // ─── createReservation ────────────────────────────────────────────────────

    @Test
    @DisplayName("createReservation: reserves stock and creates reservation")
    void createReservation_valid_reservesStockAndCreatesReservation() {
        MerchandiseProduct product = buildProduct();
        ProductVariant variant = buildVariant(product, 5);

        when(variantRepository.findByIdWithLock(VARIANT_ID)).thenReturn(Optional.of(variant));
        when(reservationRepository.countActivePendingByStudentAndProduct(STUDENT_ID, product.getId()))
                .thenReturn(0L);
        when(variantRepository.save(any())).thenReturn(variant);
        when(reservationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        ReservationResponse response = service.createReservation(STUDENT_ID, VARIANT_ID);

        assertThat(response.status()).isEqualTo("PENDING");
        assertThat(variant.getStock()).isEqualTo(4); // decremented by 1
        verify(eventPublisher).publishEvent(any());
    }

    @Test
    @DisplayName("createReservation: variant not found throws ResourceNotFoundException")
    void createReservation_variantNotFound_throwsNotFoundException() {
        when(variantRepository.findByIdWithLock(VARIANT_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.createReservation(STUDENT_ID, VARIANT_ID))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("createReservation: insufficient stock throws InsufficientStockException")
    void createReservation_noStock_throwsInsufficientStock() {
        MerchandiseProduct product = buildProduct();
        ProductVariant variant = buildVariant(product, 0); // no stock

        when(variantRepository.findByIdWithLock(VARIANT_ID)).thenReturn(Optional.of(variant));
        when(reservationRepository.countActivePendingByStudentAndProduct(STUDENT_ID, product.getId()))
                .thenReturn(0L);

        assertThatThrownBy(() -> service.createReservation(STUDENT_ID, VARIANT_ID))
                .isInstanceOf(InsufficientStockException.class);

        verify(reservationRepository, never()).save(any());
    }

    @Test
    @DisplayName("createReservation: reservation limit exceeded throws ReservationLimitExceededException")
    void createReservation_limitExceeded_throwsLimitException() {
        MerchandiseProduct product = buildProduct();
        ProductVariant variant = buildVariant(product, 10);

        when(variantRepository.findByIdWithLock(VARIANT_ID)).thenReturn(Optional.of(variant));
        when(reservationRepository.countActivePendingByStudentAndProduct(STUDENT_ID, product.getId()))
                .thenReturn(2L); // already at max

        assertThatThrownBy(() -> service.createReservation(STUDENT_ID, VARIANT_ID))
                .isInstanceOf(ReservationLimitExceededException.class);

        verify(variantRepository, never()).save(any());
        verify(reservationRepository, never()).save(any());
    }

    // ─── cancelReservation ────────────────────────────────────────────────────

    @Test
    @DisplayName("cancelReservation: restores stock and transitions to CANCELLED")
    void cancelReservation_owner_cancelsAndRestoresStock() {
        MerchandiseProduct product = buildProduct();
        ProductVariant variant = buildVariant(product, 0); // stock depleted by reservation
        Reservation reservation = Reservation.create(STUDENT_ID, variant);

        when(reservationRepository.findById(RESERVATION_ID)).thenReturn(Optional.of(reservation));
        when(variantRepository.save(any())).thenReturn(variant);
        when(reservationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        ReservationResponse response = service.cancelReservation(STUDENT_ID, RESERVATION_ID);

        assertThat(response.status()).isEqualTo("CANCELLED");
        assertThat(variant.getStock()).isEqualTo(1); // restored
    }

    @Test
    @DisplayName("cancelReservation: non-owner gets 403 Forbidden")
    void cancelReservation_nonOwner_throwsForbidden() {
        MerchandiseProduct product = buildProduct();
        ProductVariant variant = buildVariant(product, 0);
        Reservation reservation = Reservation.create(UUID.randomUUID(), variant); // different student

        when(reservationRepository.findById(RESERVATION_ID)).thenReturn(Optional.of(reservation));

        assertThatThrownBy(() -> service.cancelReservation(STUDENT_ID, RESERVATION_ID))
                .isInstanceOf(AppException.class)
                .satisfies(ex -> assertThat(((AppException) ex).getStatus()).isEqualTo(HttpStatus.FORBIDDEN));
    }

    @Test
    @DisplayName("cancelReservation: reservation not found throws ResourceNotFoundException")
    void cancelReservation_notFound_throwsNotFoundException() {
        when(reservationRepository.findById(RESERVATION_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.cancelReservation(STUDENT_ID, RESERVATION_ID))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ─── Domain rules — Reservation ───────────────────────────────────────────

    @Test
    @DisplayName("Reservation.expire(): idempotent — expired reservation does nothing on second call")
    void reservation_expire_isIdempotent() {
        MerchandiseProduct product = buildProduct();
        ProductVariant variant = buildVariant(product, 0);
        Reservation reservation = Reservation.create(STUDENT_ID, variant);

        reservation.expire(); // first expire: restores 1 stock
        int stockAfterFirstExpiry = variant.getStock();

        reservation.expire(); // second expire: idempotent, stock unchanged
        assertThat(variant.getStock()).isEqualTo(stockAfterFirstExpiry);
    }

    @Test
    @DisplayName("Reservation.cancel(): already expired reservation throws 400")
    void reservation_cancelAfterExpiry_throwsBadRequest() {
        MerchandiseProduct product = buildProduct();
        ProductVariant variant = buildVariant(product, 1);
        Reservation reservation = Reservation.create(STUDENT_ID, variant);

        reservation.expire(); // expire first

        assertThatThrownBy(reservation::cancel)
                .isInstanceOf(AppException.class)
                .satisfies(ex -> assertThat(((AppException) ex).getStatus()).isEqualTo(HttpStatus.BAD_REQUEST));
    }

    @Test
    @DisplayName("ProductVariant.reserveStock(): out of stock throws InsufficientStockException")
    void variant_reserveStock_outOfStock_throwsInsufficientStock() {
        MerchandiseProduct product = buildProduct();
        ProductVariant variant = buildVariant(product, 0);

        assertThatThrownBy(variant::reserveStock)
                .isInstanceOf(InsufficientStockException.class);
    }

    // ─── uploadImage ──────────────────────────────────────────────────────────

    @Test
    @DisplayName("uploadImage: delegates to storage under the 'exchange' category and returns the URL")
    void uploadImage_delegatesToStorage_returnsUrl() {
        MultipartFile file = mock(MultipartFile.class);
        when(storageService.store(file, "exchange")).thenReturn("/uploads/exchange/abc.png");

        UploadImageResponse response = service.uploadImage(file);

        assertThat(response.url()).isEqualTo("/uploads/exchange/abc.png");
        verify(storageService).store(file, "exchange");
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private MerchandiseProduct buildProduct() {
        return MerchandiseProduct.create("NU Shirt", "Official NU shirt", null, MerchandiseCategory.CLOTHING);
    }

    private ProductVariant buildVariant(MerchandiseProduct product, int stock) {
        return ProductVariant.create(product, "M", "Blue", "SKU-001", stock, BigDecimal.valueOf(299));
    }
}
