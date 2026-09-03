package com.alumni.platform.notification.dto;

import jakarta.validation.constraints.NotNull;

public class PreferenceRequest {
    @NotNull
    private Boolean emailEnabled;
    @NotNull
    private Boolean inAppEnabled;
    @NotNull
    private Boolean emailOnMentorshipRequest;
    @NotNull
    private Boolean emailOnBookingConfirmed;
    @NotNull
    private Boolean emailOnSessionReminder;
    @NotNull
    private Boolean emailOnReviewPublished;

    // getters/setters
    public Boolean getEmailEnabled() { return emailEnabled; }
    public void setEmailEnabled(Boolean emailEnabled) { this.emailEnabled = emailEnabled; }
    public Boolean getInAppEnabled() { return inAppEnabled; }
    public void setInAppEnabled(Boolean inAppEnabled) { this.inAppEnabled = inAppEnabled; }
    public Boolean getEmailOnMentorshipRequest() { return emailOnMentorshipRequest; }
    public void setEmailOnMentorshipRequest(Boolean emailOnMentorshipRequest) { this.emailOnMentorshipRequest = emailOnMentorshipRequest; }
    public Boolean getEmailOnBookingConfirmed() { return emailOnBookingConfirmed; }
    public void setEmailOnBookingConfirmed(Boolean emailOnBookingConfirmed) { this.emailOnBookingConfirmed = emailOnBookingConfirmed; }
    public Boolean getEmailOnSessionReminder() { return emailOnSessionReminder; }
    public void setEmailOnSessionReminder(Boolean emailOnSessionReminder) { this.emailOnSessionReminder = emailOnSessionReminder; }
    public Boolean getEmailOnReviewPublished() { return emailOnReviewPublished; }
    public void setEmailOnReviewPublished(Boolean emailOnReviewPublished) { this.emailOnReviewPublished = emailOnReviewPublished; }
}