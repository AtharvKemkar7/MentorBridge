package com.alumni.platform.notification.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public class EmailTemplateResponse {
    private UUID id;
    private String name;
    private String subject;
    private String body;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public EmailTemplateResponse() {}

    public EmailTemplateResponse(UUID id, String name, String subject, String body,
                                 OffsetDateTime createdAt, OffsetDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.subject = subject;
        this.body = body;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public UUID getId() { return id; }
    public String getName() { return name; }
    public String getSubject() { return subject; }
    public String getBody() { return body; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
}