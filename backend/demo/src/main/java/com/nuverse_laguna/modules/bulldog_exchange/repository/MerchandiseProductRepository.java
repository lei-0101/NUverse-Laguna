package com.nuverse_laguna.modules.bulldog_exchange.repository;

import com.nuverse_laguna.modules.bulldog_exchange.domain.MerchandiseCategory;
import com.nuverse_laguna.modules.bulldog_exchange.domain.MerchandiseGender;
import com.nuverse_laguna.modules.bulldog_exchange.domain.MerchandiseProduct;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface MerchandiseProductRepository extends JpaRepository<MerchandiseProduct, UUID> {

    @EntityGraph(attributePaths = "variants")
    Page<MerchandiseProduct> findByActiveTrue(Pageable pageable);

    @EntityGraph(attributePaths = "variants")
    Page<MerchandiseProduct> findByCategoryAndActiveTrue(MerchandiseCategory category, Pageable pageable);

    @EntityGraph(attributePaths = "variants")
    Page<MerchandiseProduct> findByGenderAndActiveTrue(MerchandiseGender gender, Pageable pageable);

    @EntityGraph(attributePaths = "variants")
    Page<MerchandiseProduct> findByCategoryAndGenderAndActiveTrue(MerchandiseCategory category,
                                                                   MerchandiseGender gender, Pageable pageable);

    @EntityGraph(attributePaths = "variants")
    @Query("SELECT p FROM MerchandiseProduct p WHERE p.active = true AND LOWER(p.name) LIKE LOWER(CONCAT('%', :kw, '%'))")
    Page<MerchandiseProduct> searchByName(@Param("kw") String keyword, Pageable pageable);

    @EntityGraph(attributePaths = "variants")
    @Query("SELECT p FROM MerchandiseProduct p WHERE p.active = true AND p.category = :cat AND LOWER(p.name) LIKE LOWER(CONCAT('%', :kw, '%'))")
    Page<MerchandiseProduct> searchByNameAndCategory(@Param("kw") String keyword, @Param("cat") MerchandiseCategory category, Pageable pageable);

    @Query("SELECT p FROM MerchandiseProduct p LEFT JOIN FETCH p.variants WHERE p.id = :id")
    Optional<MerchandiseProduct> findByIdWithVariants(@Param("id") UUID id);
}
