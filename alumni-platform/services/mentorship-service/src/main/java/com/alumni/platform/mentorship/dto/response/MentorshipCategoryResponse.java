package com.alumni.platform.mentorship.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class MentorshipCategoryResponse {

    private UUID id;
    private String name;
    private String description;
    private String icon;
    private Boolean isActive;
    private Integer sortOrder;
    private Instant createdAt;
    private Instant updatedAt;
}