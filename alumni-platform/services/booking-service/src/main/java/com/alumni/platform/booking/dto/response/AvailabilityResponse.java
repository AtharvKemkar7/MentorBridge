package com.alumni.platform.booking.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Data
@Builder
public class AvailabilityResponse {
    private UUID id;
    private UUID alumniId;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private String timezone;
    private Boolean isRecurring;
    private String recurrencePattern;
    private LocalDate recurrenceEndDate;
    private String notes;
    private Instant createdAt;
    private Instant updatedAt;
}