package com.alumni.platform.profile.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class CareerInterestRequest {

    @Size(max = 100, message = "Desired role must not exceed 100 characters")
    private String desiredRole;

    @Size(max = 100, message = "Industry must not exceed 100 characters")
    private String industry;

    private String[] preferredLocations;

    @Pattern(regexp = "^(REMOTE|HYBRID|ON_SITE|FLEXIBLE)$", message = "Remote preference must be REMOTE, HYBRID, ON_SITE, or FLEXIBLE")
    private String remotePreference;

    @Min(value = 0, message = "Expected salary min must be non-negative")
    private Long expectedSalaryMin;

    @Min(value = 0, message = "Expected salary max must be non-negative")
    private Long expectedSalaryMax;

    @Size(max = 1000, message = "Notes must not exceed 1000 characters")
    private String notes;

    @Min(value = 1, message = "Priority must be at least 1")
    @Max(value = 10, message = "Priority must not exceed 10")
    private Integer priority = 1;
}