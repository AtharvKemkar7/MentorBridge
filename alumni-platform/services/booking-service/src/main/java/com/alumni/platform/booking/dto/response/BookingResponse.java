package com.alumni.platform.booking.dto.response;

import com.alumni.platform.booking.entity.Booking;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class BookingResponse {
    private UUID id;
    private UUID studentId;
    private UUID alumniId;
    private UUID slotId;
    private UUID mentorshipId;
    private Booking.BookingStatus status;
    private String notes;
    private UUID cancelledBy;
    private String cancelledReason;
    private Instant cancelledAt;
    private Instant confirmedAt;
    private Instant createdAt;
    private Instant updatedAt;
}