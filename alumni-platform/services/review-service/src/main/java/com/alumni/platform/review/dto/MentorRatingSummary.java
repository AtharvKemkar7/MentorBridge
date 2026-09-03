package com.alumni.platform.review.dto;

import java.util.UUID;

public class MentorRatingSummary {
    private UUID mentorId;
    private Double averageRating;
    private Long reviewCount;

    public MentorRatingSummary() {}

    public MentorRatingSummary(UUID mentorId, Double averageRating, Long reviewCount) {
        this.mentorId = mentorId;
        this.averageRating = averageRating;
        this.reviewCount = reviewCount;
    }

    public UUID getMentorId() { return mentorId; }
    public void setMentorId(UUID mentorId) { this.mentorId = mentorId; }

    public Double getAverageRating() { return averageRating; }
    public void setAverageRating(Double averageRating) { this.averageRating = averageRating; }

    public Long getReviewCount() { return reviewCount; }
    public void setReviewCount(Long reviewCount) { this.reviewCount = reviewCount; }
}