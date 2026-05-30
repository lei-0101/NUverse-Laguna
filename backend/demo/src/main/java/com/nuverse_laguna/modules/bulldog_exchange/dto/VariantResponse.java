package com.nuverse_laguna.modules.bulldog_exchange.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record VariantResponse(
        UUID id,
        String size,
        String color,
        String sku,
        int stock,
        BigDecimal price,
        boolean available
) {}
