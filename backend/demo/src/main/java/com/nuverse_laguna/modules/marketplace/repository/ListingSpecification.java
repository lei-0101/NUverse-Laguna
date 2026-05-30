package com.nuverse_laguna.modules.marketplace.repository;

import com.nuverse_laguna.modules.marketplace.domain.ListingCategory;
import com.nuverse_laguna.modules.marketplace.domain.ListingCondition;
import com.nuverse_laguna.modules.marketplace.domain.ListingStatus;
import com.nuverse_laguna.modules.marketplace.domain.MarketplaceListing;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Stream;

public final class ListingSpecification {

    private ListingSpecification() {}

    public static Specification<MarketplaceListing> build(
            String keyword,
            ListingCategory category,
            ListingCondition condition,
            BigDecimal minPrice,
            BigDecimal maxPrice
    ) {
        // Compose only the active filters; absent ones return null and are skipped
        // (Spring Data's Specification.and rejects null operands).
        return Stream.of(
                        withStatus(ListingStatus.AVAILABLE),
                        withKeyword(keyword),
                        withCategory(category),
                        withCondition(condition),
                        withPriceRange(minPrice, maxPrice))
                .filter(Objects::nonNull)
                .reduce(Specification::and)
                .orElseThrow();
    }

    private static Specification<MarketplaceListing> withStatus(ListingStatus status) {
        return (root, query, cb) -> cb.equal(root.get("status"), status);
    }

    private static Specification<MarketplaceListing> withKeyword(String keyword) {
        if (keyword == null || keyword.isBlank()) return null;
        return (root, query, cb) -> {
            String pattern = "%" + keyword.toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("title")), pattern),
                    cb.like(cb.lower(root.get("description")), pattern)
            );
        };
    }

    private static Specification<MarketplaceListing> withCategory(ListingCategory category) {
        if (category == null) return null;
        return (root, query, cb) -> cb.equal(root.get("category"), category);
    }

    private static Specification<MarketplaceListing> withCondition(ListingCondition condition) {
        if (condition == null) return null;
        return (root, query, cb) -> cb.equal(root.get("condition"), condition);
    }

    private static Specification<MarketplaceListing> withPriceRange(BigDecimal minPrice, BigDecimal maxPrice) {
        if (minPrice == null && maxPrice == null) return null;
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (minPrice != null) predicates.add(cb.greaterThanOrEqualTo(root.get("price"), minPrice));
            if (maxPrice != null) predicates.add(cb.lessThanOrEqualTo(root.get("price"), maxPrice));
            return cb.and(predicates.toArray(Predicate[]::new));
        };
    }
}
