package com.alumni.platform.institution.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public class AuditLogResponse {
    private UUID id;
    private UUID adminUserId;
    private String action;
    private String targetType;
    private UUID targetId;
    private String details;
    private OffsetDateTime createdAt;

    public AuditLogResponse() {}

    public AuditLogResponse(UUID id, UUID adminUserId, String action, String targetType,
                            UUID targetId, String details, OffsetDateTime createdAt) {
        this.id = id;
        this.adminUserId = adminUserId;
        this.action = action;
        this.targetType = targetType;
        this.targetId = targetId;
        this.details = details;
        this.createdAt = createdAt;
    }

    // getters
    public UUID getId() { return id; }
    public UUID getAdminUserId() { return adminUserId; }
    public String getAction() { return action; }
    public String getTargetType() { return targetType; }
    public UUID getTargetId() { return targetId; }
    public String getDetails() { return details; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}