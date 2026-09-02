package com.alumni.platform.profile.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ExperienceRequest {

    @NotBlank(message = "Company is required")
    @Size(max = 200, message = "Company must not exceed 200 characters")
    private String company;

    @NotBlank(message = "Job title is required")
    @Size(max = 200, message = "Job title must not exceed 200 characters")
    private String jobTitle;

    @Size(max = 200, message = "Location must not exceed 200 characters")
    private String location;

    @Size(max = 30, message = "Employment type must not exceed 30 characters")
    private String employmentType;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    private LocalDate endDate;

    private Boolean isCurrent = false;

    @Size(max = 3000, message = "Description must not exceed 3000 characters")
    private String description;

    @Size(max = 3000, message = "Achievements must not exceed 3000 characters")
    private String achievements;
}