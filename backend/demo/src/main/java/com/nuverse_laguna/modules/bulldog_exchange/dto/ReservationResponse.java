package com.nuverse_laguna.modules.bulldog_exchange.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record ReservationResponse(
        UUID id,
        UUID variantId,
        UUID productId,
        String productName,
        String size,
        String color,
        String sku,
        BigDecimal price,
        String status,
        LocalDateTime expiresAt,
        LocalDateTime createdAt
) {}
