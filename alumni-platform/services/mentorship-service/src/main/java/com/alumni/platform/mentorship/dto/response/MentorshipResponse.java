package com.alumni.platform.mentorship.dto.response;

import com.alumni.platform.mentorship.entity.Mentorship;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class MentorshipResponse {

    private UUID id;
    private UUID studentId;
    private UUID alumniId;
    private UUID categoryId;
    private String categoryName;
    private Mentorship.MentorshipStatus status;
    private String goals;
    private Instant startedAt;
    private Instant endedAt;
    private String endedReason;
    private Instant createdAt;
    private Instant updatedAt;
}