package com.nuverse_laguna.modules.bulldog_exchange.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record AddVariantRequest(

        @Size(max = 20, message = "Size must be 20 characters or less")
        String size,

        @Size(max = 50, message = "Color must be 50 characters or less")
        String color,

        @NotBlank(message = "SKU is required")
        @Size(max = 100, message = "SKU must be 100 characters or less")
        String sku,

        @NotNull(message = "Stock is required")
        @Min(value = 0, message = "Stock cannot be negative")
        Integer stock,

        @NotNull(message = "Price is required")
        @DecimalMin(value = "0.00", message = "Price must be 0 or greater")
        @Digits(integer = 8, fraction = 2, message = "Invalid price format")
        BigDecimal price
) {}
