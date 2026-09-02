package com.alumni.platform.booking.dto.response;

import com.alumni.platform.booking.entity.Slot;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@Builder
public class SlotResponse {
    private UUID id;
    private UUID availabilityId;
    private UUID alumniId;
    private ZonedDateTime startTime;
    private ZonedDateTime endTime;
    private Slot.SlotStatus status;
    private UUID bookedBy;
    private Instant createdAt;
    private Instant updatedAt;
}