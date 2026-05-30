package com.nuverse_laguna.modules.bulldog_exchange.repository;

import com.nuverse_laguna.modules.bulldog_exchange.domain.MerchandiseCategory;
import com.nuverse_laguna.modules.bulldog_exchange.domain.MerchandiseProduct;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface MerchandiseProductRepository extends JpaRepository<MerchandiseProduct, UUID> {

    Page<MerchandiseProduct> findByActiveTrue(Pageable pageable);

    Page<MerchandiseProduct> findByCategoryAndActiveTrue(MerchandiseCategory category, Pageable pageable);

    @Query("SELECT p FROM MerchandiseProduct p LEFT JOIN FETCH p.variants WHERE p.id = :id")
    Optional<MerchandiseProduct> findByIdWithVariants(@Param("id") UUID id);
}
