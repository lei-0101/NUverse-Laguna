package com.nuverse_laguna.modules.profile.dto;

import com.nuverse_laguna.modules.profile.domain.YearLevel;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(

        @Size(max = 100, message = "Full name must be 100 characters or less")
        String fullName,

        @Size(max = 500, message = "Bio must be 500 characters or less")
        String bio,

        @Size(max = 100, message = "Course must be 100 characters or less")
        String course,

        YearLevel yearLevel,

        @Size(max = 255, message = "Interests must be 255 characters or less")
        String interests
) {}
