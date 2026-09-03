package com.alumni.platform.notification.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public class NotificationResponse {
    private UUID id;
    private UUID userId;
    private String type;
    private String title;
    private String body;
    private String channel;
    private String status;
    private Boolean read;
    private UUID referenceId;
    private String referenceType;
    private OffsetDateTime createdAt;
    private OffsetDateTime sentAt;
    private OffsetDateTime readAt;

    public NotificationResponse() {}

    public NotificationResponse(UUID id, UUID userId, String type, String title, String body,
                                String channel, String status, Boolean read,
                                UUID referenceId, String referenceType,
                                OffsetDateTime createdAt, OffsetDateTime sentAt, OffsetDateTime readAt) {
        this.id = id;
        this.userId = userId;
        this.type = type;
        this.title = title;
        this.body = body;
        this.channel = channel;
        this.status = status;
        this.read = read;
        this.referenceId = referenceId;
        this.referenceType = referenceType;
        this.createdAt = createdAt;
        this.sentAt = sentAt;
        this.readAt = readAt;
    }

    // getters
    public UUID getId() { return id; }
    public UUID getUserId() { return userId; }
    public String getType() { return type; }
    public String getTitle() { return title; }
    public String getBody() { return body; }
    public String getChannel() { return channel; }
    public String getStatus() { return status; }
    public Boolean getRead() { return read; }
    public UUID getReferenceId() { return referenceId; }
    public String getReferenceType() { return referenceType; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getSentAt() { return sentAt; }
    public OffsetDateTime getReadAt() { return readAt; }
}