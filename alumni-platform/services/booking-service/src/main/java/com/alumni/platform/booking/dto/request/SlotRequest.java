package com.alumni.platform.booking.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.ZonedDateTime;

@Data
public class SlotRequest {

    @NotNull(message = "Start time is required")
    private ZonedDateTime startTime;

    @NotNull(message = "End time is required")
    private ZonedDateTime endTime;
}