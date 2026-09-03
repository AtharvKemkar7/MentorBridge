package com.alumni.platform.notification.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public class PreferenceResponse {
    private UUID userId;
    private Boolean emailEnabled;
    private Boolean inAppEnabled;
    private Boolean emailOnMentorshipRequest;
    private Boolean emailOnBookingConfirmed;
    private Boolean emailOnSessionReminder;
    private Boolean emailOnReviewPublished;
    private OffsetDateTime updatedAt;

    public PreferenceResponse() {}

    public PreferenceResponse(UUID userId, Boolean emailEnabled, Boolean inAppEnabled,
                              Boolean emailOnMentorshipRequest, Boolean emailOnBookingConfirmed,
                              Boolean emailOnSessionReminder, Boolean emailOnReviewPublished,
                              OffsetDateTime updatedAt) {
        this.userId = userId;
        this.emailEnabled = emailEnabled;
        this.inAppEnabled = inAppEnabled;
        this.emailOnMentorshipRequest = emailOnMentorshipRequest;
        this.emailOnBookingConfirmed = emailOnBookingConfirmed;
        this.emailOnSessionReminder = emailOnSessionReminder;
        this.emailOnReviewPublished = emailOnReviewPublished;
        this.updatedAt = updatedAt;
    }

    // getters
    public UUID getUserId() { return userId; }
    public Boolean getEmailEnabled() { return emailEnabled; }
    public Boolean getInAppEnabled() { return inAppEnabled; }
    public Boolean getEmailOnMentorshipRequest() { return emailOnMentorshipRequest; }
    public Boolean getEmailOnBookingConfirmed() { return emailOnBookingConfirmed; }
    public Boolean getEmailOnSessionReminder() { return emailOnSessionReminder; }
    public Boolean getEmailOnReviewPublished() { return emailOnReviewPublished; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
}