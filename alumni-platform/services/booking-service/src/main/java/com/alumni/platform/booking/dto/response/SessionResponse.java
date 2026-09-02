package com.alumni.platform.booking.dto.response;

import com.alumni.platform.booking.entity.Session;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@Builder
public class SessionResponse {
    private UUID id;
    private UUID bookingId;
    private UUID studentId;
    private UUID alumniId;
    private ZonedDateTime startTime;
    private ZonedDateTime endTime;
    private Session.SessionStatus status;
    private String meetingLink;
    private String notes;
    private Instant completedAt;
    private UUID completedBy;
    private Instant createdAt;
    private Instant updatedAt;
}