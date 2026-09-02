package com.alumni.platform.profile.dto.request;

import com.alumni.platform.profile.entity.Education;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.UUID;

@Data
public class EducationRequest {

    @NotBlank(message = "Institution is required")
    @Size(max = 200, message = "Institution must not exceed 200 characters")
    private String institution;

    @Size(max = 100, message = "Degree must not exceed 100 characters")
    private String degree;

    @Size(max = 100, message = "Field of study must not exceed 100 characters")
    private String fieldOfStudy;

    @Min(value = 1950, message = "Start year must be after 1950")
    @Max(value = 2030, message = "Start year must be before 2030")
    private Integer startYear;

    @Min(value = 1950, message = "Graduation year must be after 1950")
    @Max(value = 2030, message = "Graduation year must be before 2030")
    private Integer graduationYear;

    @Size(max = 20, message = "Grade must not exceed 20 characters")
    private String grade;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;

    private Education.EducationType educationType;

    private Boolean isCurrent = false;
}