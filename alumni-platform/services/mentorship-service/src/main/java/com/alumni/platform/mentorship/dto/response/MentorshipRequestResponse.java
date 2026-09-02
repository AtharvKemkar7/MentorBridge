package com.alumni.platform.mentorship.dto.response;

import com.alumni.platform.mentorship.entity.MentorshipRequest;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class MentorshipRequestResponse {

    private UUID id;
    private UUID studentId;
    private UUID alumniId;
    private UUID categoryId;
    private String categoryName;
    private String message;
    private MentorshipRequest.RequestStatus status;
    private String responseMessage;
    private Instant respondedAt;
    private Instant createdAt;
    private Instant updatedAt;
}