package com.alumni.platform.booking.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.ZonedDateTime;

@Data
public class SessionRequest {

    @NotNull(message = "Start time is required")
    private ZonedDateTime startTime;

    @NotNull(message = "End time is required")
    private ZonedDateTime endTime;

    @Size(max = 500, message = "Meeting link must not exceed 500 characters")
    private String meetingLink;

    @Size(max = 3000, message = "Notes must not exceed 3000 characters")
    private String notes;
}