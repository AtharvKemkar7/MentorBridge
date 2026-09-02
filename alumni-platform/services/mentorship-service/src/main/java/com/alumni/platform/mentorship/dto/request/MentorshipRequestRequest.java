package com.alumni.platform.mentorship.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.UUID;

@Data
public class MentorshipRequestRequest {

    @NotNull(message = "Student ID is required")
    private UUID studentId;

    @NotNull(message = "Alumni ID is required")
    private UUID alumniId;

    @NotNull(message = "Category ID is required")
    private UUID categoryId;

    @Size(max = 2000, message = "Message must not exceed 2000 characters")
    private String message;
}