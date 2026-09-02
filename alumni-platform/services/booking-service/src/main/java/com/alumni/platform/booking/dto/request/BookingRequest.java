package com.alumni.platform.booking.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.UUID;

@Data
public class BookingRequest {

    @NotNull(message = "Slot ID is required")
    private UUID slotId;

    private UUID mentorshipId;

    @Size(max = 2000, message = "Notes must not exceed 2000 characters")
    private String notes;
}