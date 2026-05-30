package com.nuverse_laguna.modules.bulldog_exchange.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record ProductCardResponse(
        UUID id,
        String name,
        String category,
        String imageUrl,
        int variantCount,
        BigDecimal minPrice,
        boolean hasStock
) {}
