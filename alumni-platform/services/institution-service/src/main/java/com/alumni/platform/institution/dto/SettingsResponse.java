package com.alumni.platform.institution.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public class SettingsResponse {
    private UUID id;
    private UUID instituteId;
    private String key;
    private String value;
    private String description;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public SettingsResponse() {}

    public SettingsResponse(UUID id, UUID instituteId, String key, String value,
                            String description, OffsetDateTime createdAt, OffsetDateTime updatedAt) {
        this.id = id;
        this.instituteId = instituteId;
        this.key = key;
        this.value = value;
        this.description = description;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // getters
    public UUID getId() { return id; }
    public UUID getInstituteId() { return instituteId; }
    public String getKey() { return key; }
    public String getValue() { return value; }
    public String getDescription() { return description; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
}