package com.alumni.platform.profile.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class StudentProfileRequest {

    @Size(max = 50, message = "Student ID must not exceed 50 characters")
    private String studentId;

    @Size(max = 100, message = "Department must not exceed 100 characters")
    private String department;

    @Size(max = 100, message = "Program must not exceed 100 characters")
    private String program;

    @Size(max = 20, message = "Batch must not exceed 20 characters")
    private String batch;

    @Min(value = 1950, message = "Graduation year must be after 1950")
    @Max(value = 2030, message = "Graduation year must be before 2030")
    private Integer graduationYear;

    @Min(value = 1, message = "Current semester must be at least 1")
    @Max(value = 12, message = "Current semester must not exceed 12")
    private Integer currentSemester;

    @DecimalMin(value = "0.0", message = "CGPA must be non-negative")
    @DecimalMax(value = "10.0", message = "CGPA must not exceed 10.0")
    private BigDecimal cgpa;

    @Size(max = 2000, message = "Bio must not exceed 2000 characters")
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

    private Boolean willingToRelocate = false;

    private Boolean isPublic = true;
}