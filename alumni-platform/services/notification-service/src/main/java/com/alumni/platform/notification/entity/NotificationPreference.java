package com.alumni.platform.notification.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "notification_preferences")
public class NotificationPreference {

    @Id
    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "email_enabled", nullable = false)
    private Boolean emailEnabled = true;

    @Column(name = "in_app_enabled", nullable = false)
    private Boolean inAppEnabled = true;

    @Column(name = "email_on_mentorship_request", nullable = false)
    private Boolean emailOnMentorshipRequest = true;

    @Column(name = "email_on_booking_confirmed", nullable = false)
    private Boolean emailOnBookingConfirmed = true;

    @Column(name = "email_on_session_reminder", nullable = false)
    private Boolean emailOnSessionReminder = true;

    @Column(name = "email_on_review_published", nullable = false)
    private Boolean emailOnReviewPublished = true;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    // getters/setters
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

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

    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
}