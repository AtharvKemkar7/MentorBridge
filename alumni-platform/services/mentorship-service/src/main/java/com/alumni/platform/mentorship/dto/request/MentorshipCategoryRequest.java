package com.alumni.platform.mentorship.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class MentorshipCategoryRequest {

    @NotBlank(message = "Category name is required")
    @Size(max = 100, message = "Name must not exceed 100 characters")
    private String name;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;

    @Size(max = 200, message = "Icon must not exceed 200 characters")
    private String icon;

    private Boolean isActive = true;

    @Min(value = 0, message = "Sort order must be non-negative")
    private Integer sortOrder = 0;
}