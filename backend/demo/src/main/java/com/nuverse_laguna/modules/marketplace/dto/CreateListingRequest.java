package com.nuverse_laguna.modules.marketplace.dto;

import com.nuverse_laguna.modules.marketplace.domain.ListingCategory;
import com.nuverse_laguna.modules.marketplace.domain.ListingCondition;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.util.List;

public record CreateListingRequest(

        @NotBlank(message = "Title is required")
        @Size(max = 200, message = "Title must be 200 characters or less")
        String title,

        @NotBlank(message = "Description is required")
        @Size(max = 5000, message = "Description must be 5000 characters or less")
        String description,

        @NotNull(message = "Price is required")
        @DecimalMin(value = "0.00", message = "Price must be 0 or greater")
        @Digits(integer = 8, fraction = 2, message = "Invalid price format")
        BigDecimal price,

        @NotNull(message = "Category is required")
        ListingCategory category,

        @NotNull(message = "Condition is required")
        ListingCondition condition,

        @Size(max = 10, message = "A listing can have at most 10 images")
        List<String> imageUrls
) {}
