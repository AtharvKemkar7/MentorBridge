package com.alumni.platform.profile.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.UUID;

@Data
public class AlumniProfileRequest {

    @Size(max = 50, message = "Employee ID must not exceed 50 characters")
    private String employeeId;

    @Size(max = 100, message = "Department must not exceed 100 characters")
    private String department;

    @Size(max = 100, message = "Program must not exceed 100 characters")
    private String program;

    @Size(max = 20, message = "Batch must not exceed 20 characters")
    private String batch;

    @Min(value = 1950, message = "Graduation year must be after 1950")
    @Max(value = 2030, message = "Graduation year must be before 2030")
    private Integer graduationYear;

    @Size(max = 200, message = "Current company must not exceed 200 characters")
    private String currentCompany;

    @Size(max = 200, message = "Job title must not exceed 200 characters")
    private String jobTitle;

    @Size(max = 100, message = "Industry must not exceed 100 characters")
    private String industry;

    @Min(value = 0, message = "Total experience years must be non-negative")
    @Max(value = 50, message = "Total experience years must not exceed 50")
    private Integer totalExperienceYears;

    @Size(max = 3000, message = "Bio must not exceed 3000 characters")
    private String bio;

    @Size(max = 500, message = "LinkedIn URL must not exceed 500 characters")
    @Pattern(regexp = "^(https?://)?(www\\.)?linkedin\\.com/.*$", message = "Must be a valid LinkedIn URL")
    private String linkedinUrl;

    @Size(max = 500, message = "GitHub URL must not exceed 500 characters")
    @Pattern(regexp = "^(https?://)?(www\\.)?github\\.com/.*$", message = "Must be a valid GitHub URL")
    private String githubUrl;

    @Size(max = 500, message = "Portfolio URL must not exceed 500 characters")
    @Pattern(regexp = "^(https?://).*$", message = "Must be a valid URL")
    private String portfolioUrl;

    @Size(max = 200, message = "Location must not exceed 200 characters")
    private String location;

    private Boolean isMentor = false;

    private Integer maxMentees = 3;

    private String[] mentorshipAreas;

    private Boolean isPublic = true;
}