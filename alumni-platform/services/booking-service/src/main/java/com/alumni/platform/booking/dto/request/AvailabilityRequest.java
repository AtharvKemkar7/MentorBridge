package com.alumni.platform.booking.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZonedDateTime;
import java.util.UUID;

@Data
public class AvailabilityRequest {

    @NotNull(message = "Date is required")
    private LocalDate date;

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    private LocalTime endTime;

    @Size(max = 50, message = "Timezone must not exceed 50 characters")
    private String timezone = "UTC";

    private Boolean isRecurring = false;

    @Size(max = 50, message = "Recurrence pattern must not exceed 50 characters")
    private String recurrencePattern;

    private LocalDate recurrenceEndDate;

    @Size(max = 1000, message = "Notes must not exceed 1000 characters")
    private String notes;
}