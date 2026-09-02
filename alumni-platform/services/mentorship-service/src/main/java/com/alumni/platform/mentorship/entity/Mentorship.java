package com.alumni.platform.mentorship.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "mentorships", indexes = {
    @Index(name = "idx_mentorships_student", columnList = "student_id"),
    @Index(name = "idx_mentorships_alumni", columnList = "alumni_id"),
    @Index(name = "idx_mentorships_status", columnList = "status"),
    @Index(name = "idx_mentorships_category", columnList = "category_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Mentorship {

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

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private MentorshipStatus status = MentorshipStatus.ACTIVE;

    @Column(name = "goals", length = 3000)
    private String goals;

    @Column(name = "started_at", nullable = false)
    private Instant startedAt;

    @Column(name = "ended_at")
    private Instant endedAt;

    @Column(name = "ended_reason", length = 1000)
    private String endedReason;

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

    public enum MentorshipStatus {
        ACTIVE,
        PAUSED,
        COMPLETED,
        TERMINATED
    }
}