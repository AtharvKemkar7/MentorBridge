package com.alumni.platform.notification.event;

import com.alumni.platform.notification.service.NotificationService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class PlatformEventListener {

    private static final Logger log = LoggerFactory.getLogger(PlatformEventListener.class);

    private final NotificationService notificationService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public PlatformEventListener(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @KafkaListener(topics = "user.registered", groupId = "notification-service")
    public void onUserRegistered(String message) {
        try {
            JsonNode node = objectMapper.readTree(message);
            UUID userId = UUID.fromString(node.get("userId").asText());
            String role = node.get("role").asText();
            notificationService.createInAppNotification(userId, "WELCOME",
                    "Welcome to Alumni Platform",
                    "Your account has been created.", null, null);
            // email welcome could be sent
        } catch (Exception e) {
            log.error("Failed to process user.registered event", e);
        }
    }

    @KafkaListener(topics = "mentorship.requested", groupId = "notification-service")
    public void onMentorshipRequested(String message) {
        try {
            JsonNode node = objectMapper.readTree(message);
            UUID mentorId = UUID.fromString(node.get("mentorId").asText());
            UUID requestId = UUID.fromString(node.get("requestId").asText());
            notificationService.createInAppNotification(mentorId, "MENTORSHIP_REQUEST",
                    "New mentorship request",
                    "You have a new mentorship request.", requestId, "MENTORSHIP_REQUEST");
            notificationService.createEmailNotification(mentorId, "MENTORSHIP_REQUEST",
                    "New mentorship request",
                    "You have a new mentorship request.", requestId, "MENTORSHIP_REQUEST");
        } catch (Exception e) {
            log.error("Failed to process mentorship.requested event", e);
        }
    }

    @KafkaListener(topics = "mentorship.accepted", groupId = "notification-service")
    public void onMentorshipAccepted(String message) {
        try {
            JsonNode node = objectMapper.readTree(message);
            UUID studentId = UUID.fromString(node.get("studentId").asText());
            UUID mentorshipId = UUID.fromString(node.get("mentorshipId").asText());
            notificationService.createInAppNotification(studentId, "MENTORSHIP_ACCEPTED",
                    "Mentorship request accepted",
                    "Your mentorship request has been accepted.", mentorshipId, "MENTORSHIP");
            notificationService.createEmailNotification(studentId, "MENTORSHIP_ACCEPTED",
                    "Mentorship request accepted",
                    "Your mentorship request has been accepted.", mentorshipId, "MENTORSHIP");
        } catch (Exception e) {
            log.error("Failed to process mentorship.accepted event", e);
        }
    }

    @KafkaListener(topics = "booking.confirmed", groupId = "notification-service")
    public void onBookingConfirmed(String message) {
        try {
            JsonNode node = objectMapper.readTree(message);
            UUID studentId = UUID.fromString(node.get("studentId").asText());
            UUID mentorId = UUID.fromString(node.get("mentorId").asText());
            UUID bookingId = UUID.fromString(node.get("bookingId").asText());
            notificationService.createInAppNotification(studentId, "BOOKING_CONFIRMED",
                    "Booking confirmed",
                    "Your session has been confirmed.", bookingId, "BOOKING");
            notificationService.createEmailNotification(studentId, "BOOKING_CONFIRMED",
                    "Booking confirmed",
                    "Your session has been confirmed.", bookingId, "BOOKING");
            notificationService.createInAppNotification(mentorId, "BOOKING_CONFIRMED",
                    "Booking confirmed",
                    "A session with a student has been confirmed.", bookingId, "BOOKING");
            notificationService.createEmailNotification(mentorId, "BOOKING_CONFIRMED",
                    "Booking confirmed",
                    "A session with a student has been confirmed.", bookingId, "BOOKING");
        } catch (Exception e) {
            log.error("Failed to process booking.confirmed event", e);
        }
    }

    @KafkaListener(topics = "session.completed", groupId = "notification-service")
    public void onSessionCompleted(String message) {
        try {
            JsonNode node = objectMapper.readTree(message);
            UUID studentId = UUID.fromString(node.get("studentId").asText());
            UUID mentorId = UUID.fromString(node.get("mentorId").asText());
            UUID sessionId = UUID.fromString(node.get("sessionId").asText());
            notificationService.createInAppNotification(studentId, "SESSION_COMPLETED",
                    "Session completed",
                    "Your mentorship session has ended.", sessionId, "SESSION");
            notificationService.createInAppNotification(mentorId, "SESSION_COMPLETED",
                    "Session completed",
                    "Your mentorship session has ended.", sessionId, "SESSION");
        } catch (Exception e) {
            log.error("Failed to process session.completed event", e);
        }
    }

    @KafkaListener(topics = "review.published", groupId = "notification-service")
    public void onReviewPublished(String message) {
        try {
            JsonNode node = objectMapper.readTree(message);
            UUID mentorId = UUID.fromString(node.get("mentorId").asText());
            UUID reviewId = UUID.fromString(node.get("reviewId").asText());
            notificationService.createInAppNotification(mentorId, "REVIEW_PUBLISHED",
                    "New review received",
                    "You have received a new review.", reviewId, "REVIEW");
            notificationService.createEmailNotification(mentorId, "REVIEW_PUBLISHED",
                    "New review received",
                    "You have received a new review.", reviewId, "REVIEW");
        } catch (Exception e) {
            log.error("Failed to process review.published event", e);
        }
    }
}