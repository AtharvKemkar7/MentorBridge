package com.alumni.platform.profile.dto.request;

import com.alumni.platform.profile.entity.Skill;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.UUID;

@Data
public class SkillRequest {

    @NotBlank(message = "Skill name is required")
    @Size(max = 100, message = "Skill name must not exceed 100 characters")
    private String name;

    @Size(max = 50, message = "Category must not exceed 50 characters")
    private String category;

    private Skill.Proficiency proficiency;

    @Min(value = 0, message = "Years of experience must be non-negative")
    @Max(value = 50, message = "Years of experience must not exceed 50")
    private Integer yearsOfExperience;

    private Boolean isFeatured = false;
}