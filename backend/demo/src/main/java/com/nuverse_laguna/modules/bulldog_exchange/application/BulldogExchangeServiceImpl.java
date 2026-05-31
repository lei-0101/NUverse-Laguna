package com.nuverse_laguna.modules.bulldog_exchange.application;

import com.nuverse_laguna.modules.bulldog_exchange.domain.*;
import com.nuverse_laguna.modules.bulldog_exchange.dto.*;
import com.nuverse_laguna.modules.bulldog_exchange.repository.MerchandiseProductRepository;
import com.nuverse_laguna.modules.bulldog_exchange.repository.ProductVariantRepository;
import com.nuverse_laguna.modules.bulldog_exchange.repository.ReservationRepository;
import com.nuverse_laguna.shared.event.ReservationCreatedEvent;
import com.nuverse_laguna.shared.exception.AppException;
import com.nuverse_laguna.shared.exception.ResourceNotFoundException;
import com.nuverse_laguna.shared.storage.StorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class BulldogExchangeServiceImpl implements BulldogExchangeService {

    private static final int MAX_ACTIVE_RESERVATIONS_PER_PRODUCT = 2;
    private static final String IMAGE_CATEGORY = "exchange";

    private final MerchandiseProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final ReservationRepository reservationRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final StorageService storageService;

    // ── Images ────────────────────────────────────────────────────────────────

    @Override
    public UploadImageResponse uploadImage(MultipartFile file) {
        String url = storageService.store(file, IMAGE_CATEGORY);
        return new UploadImageResponse(url);
    }

    // ── Products ──────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public Page<ProductCardResponse> getProducts(String keyword, MerchandiseCategory category,
                                                  MerchandiseGender gender, Pageable pageable) {
        Page<MerchandiseProduct> page;
        boolean hasKeyword = keyword != null && !keyword.isBlank();

        if (hasKeyword) {
            page = (category != null)
                    ? productRepository.searchByNameAndCategory(keyword.trim(), category, pageable)
                    : productRepository.searchByName(keyword.trim(), pageable);
        } else if (category != null && gender != null) {
            page = productRepository.findByCategoryAndGenderAndActiveTrue(category, gender, pageable);
        } else if (category != null) {
            page = productRepository.findByCategoryAndActiveTrue(category, pageable);
        } else if (gender != null) {
            page = productRepository.findByGenderAndActiveTrue(gender, pageable);
        } else {
            page = productRepository.findByActiveTrue(pageable);
        }

        return page.map(this::toCardResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getProduct(UUID productId) {
        MerchandiseProduct product = productRepository.findByIdWithVariants(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", productId));
        return toDetailResponse(product);
    }

    @Override
    public ProductResponse createProduct(CreateProductRequest request) {
        MerchandiseProduct product = MerchandiseProduct.create(
                request.name(), request.description(), request.imageUrl(),
                request.category(), request.gender()
        );
        MerchandiseProduct saved = productRepository.save(product);
        log.info("Merchandise product created: {}", saved.getId());
        return toDetailResponse(saved);
    }

    @Override
    public ProductResponse updateProduct(UUID productId, UpdateProductRequest request) {
        MerchandiseProduct product = findProductById(productId);
        product.update(request.name(), request.description(), request.imageUrl(),
                request.category(), request.gender());
        return toDetailResponse(productRepository.save(product));
    }

    @Override
    public void deactivateProduct(UUID productId) {
        MerchandiseProduct product = findProductById(productId);
        product.deactivate();
        productRepository.save(product);
        log.info("Product {} deactivated", productId);
    }

    // ── Variants ──────────────────────────────────────────────────────────────

    @Override
    public ProductResponse addVariant(UUID productId, AddVariantRequest request) {
        MerchandiseProduct product = productRepository.findByIdWithVariants(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", productId));

        if (variantRepository.existsBySku(request.sku())) {
            throw new AppException(HttpStatus.CONFLICT, "SKU '" + request.sku() + "' is already in use");
        }

        ProductVariant variant = ProductVariant.create(
                product, request.size(), request.color(),
                request.sku(), request.stock(), request.price()
        );
        variantRepository.save(variant);
        log.info("Variant added to product {}: SKU {}", productId, request.sku());

        // Reload to include the new variant in the response
        return toDetailResponse(productRepository.findByIdWithVariants(productId).orElseThrow());
    }

    @Override
    public VariantResponse updateVariantStock(UUID variantId, UpdateStockRequest request) {
        ProductVariant variant = variantRepository.findByIdWithLock(variantId)
                .orElseThrow(() -> new ResourceNotFoundException("Product variant", variantId));
        variant.updateStock(request.stock());
        return toVariantResponse(variantRepository.save(variant));
    }

    @Override
    public VariantResponse updateVariant(UUID variantId, AddVariantRequest request) {
        ProductVariant variant = variantRepository.findById(variantId)
                .orElseThrow(() -> new ResourceNotFoundException("Product variant", variantId));
        variant.update(
                request.size(),
                request.color(),
                request.sku(),
                request.stock(),
                request.price()
        );
        return toVariantResponse(variantRepository.save(variant));
    }

    @Override
    public void deleteVariant(UUID variantId) {
        ProductVariant variant = variantRepository.findById(variantId)
                .orElseThrow(() -> new ResourceNotFoundException("Product variant", variantId));
        variantRepository.delete(variant);
    }

    // ── Reservations ──────────────────────────────────────────────────────────

    @Override
    public ReservationResponse createReservation(UUID studentId, UUID variantId) {
        // Pessimistic write lock — serializes concurrent stock decrements for this variant.
        ProductVariant variant = variantRepository.findByIdWithLock(variantId)
                .orElseThrow(() -> new ResourceNotFoundException("Product variant", variantId));

        long activeCount = reservationRepository.countActivePendingByStudentAndProduct(
                studentId, variant.getProduct().getId()
        );
        if (activeCount >= MAX_ACTIVE_RESERVATIONS_PER_PRODUCT) {
            throw new ReservationLimitExceededException();
        }

        variant.reserveStock(); // throws InsufficientStockException if stock == 0
        variantRepository.save(variant);

        Reservation reservation = reservationRepository.save(Reservation.create(studentId, variant));
        log.info("Reservation {} created for student {} on variant {}", reservation.getId(), studentId, variantId);

        eventPublisher.publishEvent(new ReservationCreatedEvent(
                this, reservation.getId(), studentId,
                variantId, variant.getProduct().getName()
        ));

        return toReservationResponse(reservation);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReservationResponse> getMyReservations(UUID studentId, Pageable pageable) {
        return reservationRepository.findByStudentIdOrderByCreatedAtDesc(studentId, pageable)
                .map(this::toReservationResponse);
    }

    @Override
    public ReservationResponse cancelReservation(UUID studentId, UUID reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation", reservationId));

        if (!reservation.getStudentId().equals(studentId)) {
            throw new AppException(HttpStatus.FORBIDDEN, "You do not own this reservation");
        }

        reservation.cancel(); // restores stock via variant.restoreStock()
        variantRepository.save(reservation.getVariant());
        return toReservationResponse(reservationRepository.save(reservation));
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private MerchandiseProduct findProductById(UUID id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));
    }

    private ProductCardResponse toCardResponse(MerchandiseProduct product) {
        List<ProductVariant> variants = product.getVariants();
        BigDecimal minPrice = variants.stream()
                .map(ProductVariant::getPrice)
                .min(BigDecimal::compareTo)
                .orElse(BigDecimal.ZERO);
        boolean hasStock = variants.stream().anyMatch(ProductVariant::isAvailable);
        return new ProductCardResponse(
                product.getId(), product.getName(), product.getCategory().name(),
                product.getGender() != null ? product.getGender().name() : "UNISEX",
                product.getImageUrl(), variants.size(), minPrice, hasStock,
                product.isLimited()
        );
    }

    private ProductResponse toDetailResponse(MerchandiseProduct product) {
        List<VariantResponse> variantResponses = product.getVariants().stream()
                .map(this::toVariantResponse)
                .toList();
        return new ProductResponse(
                product.getId(), product.getName(), product.getDescription(),
                product.getCategory().name(), product.getImageUrl(), product.isActive(),
                product.isLimited(),
                variantResponses, product.getCreatedAt(), product.getUpdatedAt()
        );
    }

    private VariantResponse toVariantResponse(ProductVariant variant) {
        return new VariantResponse(
                variant.getId(), variant.getSize(), variant.getColor(),
                variant.getSku(), variant.getStock(), variant.getPrice(),
                variant.isAvailable()
        );
    }

    private ReservationResponse toReservationResponse(Reservation reservation) {
        ProductVariant variant = reservation.getVariant();
        MerchandiseProduct product = variant.getProduct();
        return new ReservationResponse(
                reservation.getId(), variant.getId(), product.getId(),
                product.getName(), variant.getSize(), variant.getColor(),
                variant.getSku(), variant.getPrice(), reservation.getStatus().name(),
                reservation.getExpiresAt(), reservation.getCreatedAt()
        );
    }
}
