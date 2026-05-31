package com.nuverse_laguna.modules.bulldog_exchange.dto;

import com.nuverse_laguna.modules.bulldog_exchange.domain.MerchandiseCategory;
import com.nuverse_laguna.modules.bulldog_exchange.domain.MerchandiseGender;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateProductRequest(

        @NotBlank(message = "Product name is required")
        @Size(max = 200, message = "Name must be 200 characters or less")
        String name,

        @NotBlank(message = "Description is required")
        @Size(max = 5000, message = "Description must be 5000 characters or less")
        String description,

        @Size(max = 512, message = "Image URL must be 512 characters or less")
        String imageUrl,

        @NotNull(message = "Category is required")
        MerchandiseCategory category,

        MerchandiseGender gender
) {}
