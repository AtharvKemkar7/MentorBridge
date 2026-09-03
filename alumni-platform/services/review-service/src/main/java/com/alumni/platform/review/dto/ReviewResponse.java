package com.alumni.platform.review.dto;

import com.alumni.platform.review.entity.ReviewStatus;
import java.time.OffsetDateTime;
import java.util.UUID;

public class ReviewResponse {

    private UUID id;
    private UUID sessionId;
    private UUID mentorId;
    private UUID studentId;
    private Short rating;
    private String comment;
    private ReviewStatus status;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public ReviewResponse() {}

    public ReviewResponse(UUID id, UUID sessionId, UUID mentorId, UUID studentId,
                          Short rating, String comment, ReviewStatus status,
                          OffsetDateTime createdAt, OffsetDateTime updatedAt) {
        this.id = id;
        this.sessionId = sessionId;
        this.mentorId = mentorId;
        this.studentId = studentId;
        this.rating = rating;
        this.comment = comment;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // getters
    public UUID getId() { return id; }
    public UUID getSessionId() { return sessionId; }
    public UUID getMentorId() { return mentorId; }
    public UUID getStudentId() { return studentId; }
    public Short getRating() { return rating; }
    public String getComment() { return comment; }
    public ReviewStatus getStatus() { return status; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }

    // setters (optional)
    public void setId(UUID id) { this.id = id; }
    public void setSessionId(UUID sessionId) { this.sessionId = sessionId; }
    public void setMentorId(UUID mentorId) { this.mentorId = mentorId; }
    public void setStudentId(UUID studentId) { this.studentId = studentId; }
    public void setRating(Short rating) { this.rating = rating; }
    public void setComment(String comment) { this.comment = comment; }
    public void setStatus(ReviewStatus status) { this.status = status; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
}