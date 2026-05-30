package com.nuverse_laguna.modules.events.dto;

import com.nuverse_laguna.modules.events.domain.EventCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public record UpdateEventRequest(

        @NotBlank(message = "Title is required")
        @Size(max = 200, message = "Title must not exceed 200 characters")
        String title,

        @Size(max = 5000, message = "Description must not exceed 5000 characters")
        String description,

        @NotNull(message = "Category is required")
        EventCategory category,

        @NotBlank(message = "Location is required")
        @Size(max = 300, message = "Location must not exceed 300 characters")
        String location,

        @NotNull(message = "Start time is required")
        LocalDateTime startTime,

        LocalDateTime endTime,

        @Size(max = 500, message = "Cover image URL must not exceed 500 characters")
        String coverImageUrl,

        Integer capacity
) {}
