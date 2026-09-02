package com.alumni.platform.booking.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "sessions", indexes = {
    @Index(name = "idx_sessions_booking", columnList = "booking_id", unique = true),
    @Index(name = "idx_sessions_student", columnList = "student_id"),
    @Index(name = "idx_sessions_alumni", columnList = "alumni_id"),
    @Index(name = "idx_sessions_status", columnList = "status"),
    @Index(name = "idx_sessions_start_time", columnList = "start_time")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Session {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "booking_id", nullable = false, unique = true)
    private UUID bookingId;

    @Column(name = "student_id", nullable = false)
    private UUID studentId;

    @Column(name = "alumni_id", nullable = false)
    private UUID alumniId;

    @Column(name = "start_time", nullable = false)
    private java.time.ZonedDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private java.time.ZonedDateTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private SessionStatus status = SessionStatus.SCHEDULED;

    @Column(name = "meeting_link", length = 500)
    private String meetingLink;

    @Column(name = "notes", length = 3000)
    private String notes;

    @Column(name = "completed_at")
    private Instant completedAt;

    @Column(name = "completed_by")
    private UUID completedBy;

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

    public enum SessionStatus {
        SCHEDULED,
        IN_PROGRESS,
        COMPLETED,
        CANCELLED,
        NO_SHOW
    }
}