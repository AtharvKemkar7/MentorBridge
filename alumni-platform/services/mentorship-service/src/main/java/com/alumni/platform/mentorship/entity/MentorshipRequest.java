package com.alumni.platform.mentorship.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "mentorship_requests", indexes = {
    @Index(name = "idx_mentorship_requests_student", columnList = "student_id"),
    @Index(name = "idx_mentorship_requests_alumni", columnList = "alumni_id"),
    @Index(name = "idx_mentorship_requests_status", columnList = "status"),
    @Index(name = "idx_mentorship_requests_category", columnList = "category_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MentorshipRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "student_id", nullable = false)
    private UUID studentId;

    @Column(name = "alumni_id", nullable = false)
    private UUID alumniId;

    @Column(name = "category_id", nullable = false)
    private UUID categoryId;

    @Column(name = "message", length = 2000)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private RequestStatus status = RequestStatus.PENDING;

    @Column(name = "response_message", length = 2000)
    private String responseMessage;

    @Column(name = "responded_at")
    private Instant respondedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Version
    @Column(name = "version", nullable = false)
    @Builder.Default
    private Long version = 0L;

    public enum RequestStatus {
        PENDING,
        ACCEPTED,
        REJECTED,
        CANCELLED
    }
}