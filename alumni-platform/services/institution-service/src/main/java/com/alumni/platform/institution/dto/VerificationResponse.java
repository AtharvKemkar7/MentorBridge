package com.alumni.platform.institution.dto;

import com.alumni.platform.institution.entity.VerificationStatus;
import java.time.OffsetDateTime;
import java.util.UUID;

public class VerificationResponse {
    private UUID id;
    private UUID userId;
    private UUID instituteId;
    private VerificationStatus status;
    private String submittedDocuments;
    private UUID reviewedBy;
    private OffsetDateTime reviewedAt;
    private String rejectionReason;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public VerificationResponse() {}

    public VerificationResponse(UUID id, UUID userId, UUID instituteId, VerificationStatus status,
                                String submittedDocuments, UUID reviewedBy, OffsetDateTime reviewedAt,
                                String rejectionReason, OffsetDateTime createdAt, OffsetDateTime updatedAt) {
        this.id = id;
        this.userId = userId;
        this.instituteId = instituteId;
        this.status = status;
        this.submittedDocuments = submittedDocuments;
        this.reviewedBy = reviewedBy;
        this.reviewedAt = reviewedAt;
        this.rejectionReason = rejectionReason;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // getters
    public UUID getId() { return id; }
    public UUID getUserId() { return userId; }
    public UUID getInstituteId() { return instituteId; }
    public VerificationStatus getStatus() { return status; }
    public String getSubmittedDocuments() { return submittedDocuments; }
    public UUID getReviewedBy() { return reviewedBy; }
    public OffsetDateTime getReviewedAt() { return reviewedAt; }
    public String getRejectionReason() { return rejectionReason; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
}