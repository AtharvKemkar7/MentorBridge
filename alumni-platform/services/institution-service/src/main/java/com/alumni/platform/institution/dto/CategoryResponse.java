package com.alumni.platform.institution.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public class CategoryResponse {
    private UUID id;
    private UUID instituteId;
    private String name;
    private String description;
    private Boolean isActive;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public CategoryResponse() {}

    public CategoryResponse(UUID id, UUID instituteId, String name, String description,
                            Boolean isActive, OffsetDateTime createdAt, OffsetDateTime updatedAt) {
        this.id = id;
        this.instituteId = instituteId;
        this.name = name;
        this.description = description;
        this.isActive = isActive;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // getters
    public UUID getId() { return id; }
    public UUID getInstituteId() { return instituteId; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public Boolean getIsActive() { return isActive; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
}