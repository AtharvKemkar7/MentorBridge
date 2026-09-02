package com.alumni.platform.profile.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ExpertiseAreaRequest {

    @NotBlank(message = "Expertise area name is required")
    @Size(max = 100, message = "Name must not exceed 100 characters")
    private String name;

    @Size(max = 50, message = "Category must not exceed 50 characters")
    private String category;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;

    @Min(value = 0, message = "Years of experience must be non-negative")
    @Max(value = 50, message = "Years of experience must not exceed 50")
    private Integer yearsOfExperience;

    private Boolean isMentoringArea = true;
}