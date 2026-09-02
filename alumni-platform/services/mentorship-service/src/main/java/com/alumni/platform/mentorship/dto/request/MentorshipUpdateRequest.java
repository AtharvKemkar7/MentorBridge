package com.alumni.platform.mentorship.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.UUID;

@Data
public class MentorshipUpdateRequest {

    @Size(max = 3000, message = "Goals must not exceed 3000 characters")
    private String goals;

    private UUID categoryId;
}