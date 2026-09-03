package com.alumni.platform.review.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Component
public class EligibilityClientImpl implements EligibilityClient {

    private final WebClient webClient;

    public EligibilityClientImpl(@Value("${booking.service.url:http://localhost:8085}") String baseUrl) {
        this.webClient = WebClient.builder().baseUrl(baseUrl).build();
    }

    @Override
    public boolean isEligible(UUID sessionId, UUID studentId) {
        // Call Booking Service: GET /api/sessions/{sessionId}/eligibility?studentId={studentId}
        // Expect 200 with {eligible:true}
        try {
            Boolean eligible = webClient.get()
                    .uri(uriBuilder -> uriBuilder.path("/api/sessions/{sessionId}/eligibility")
                            .queryParam("studentId", studentId)
                            .build(sessionId))
                    .retrieve()
                    .bodyToMono(EligibilityResponse.class)
                    .map(EligibilityResponse::isEligible)
                    .onErrorResume(e -> Mono.just(false))
                    .block();
            return Boolean.TRUE.equals(eligible);
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public UUID getMentorIdForSession(UUID sessionId) {
        try {
            SessionInfo info = webClient.get()
                    .uri("/api/sessions/{sessionId}", sessionId)
                    .retrieve()
                    .bodyToMono(SessionInfo.class)
                    .onErrorResume(e -> Mono.empty())
                    .block();
            return info != null ? info.getMentorId() : null;
        } catch (Exception e) {
            return null;
        }
    }

    // DTOs for responses
    private static class EligibilityResponse {
        private boolean eligible;
        public boolean isEligible() { return eligible; }
        public void setEligible(boolean eligible) { this.eligible = eligible; }
    }

    private static class SessionInfo {
        private UUID mentorId;
        public UUID getMentorId() { return mentorId; }
        public void setMentorId(UUID mentorId) { this.mentorId = mentorId; }
    }
}