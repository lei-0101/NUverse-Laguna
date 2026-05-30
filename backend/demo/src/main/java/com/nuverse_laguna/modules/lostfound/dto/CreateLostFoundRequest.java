package com.nuverse_laguna.modules.lostfound.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record CreateLostFoundRequest(
        @NotBlank String type,
        @NotBlank @Size(max = 200) String title,
        @NotBlank String description,
        @NotBlank @Size(max = 300) String location,
        @NotNull LocalDate itemDate,
        String imageUrl,
        @NotBlank @Size(max = 200) String contact
) {}
