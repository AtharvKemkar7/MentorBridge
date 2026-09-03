package com.alumni.platform.review.service;

import java.util.UUID;

public interface EligibilityClient {
    boolean isEligible(UUID sessionId, UUID studentId);
    UUID getMentorIdForSession(UUID sessionId);
}