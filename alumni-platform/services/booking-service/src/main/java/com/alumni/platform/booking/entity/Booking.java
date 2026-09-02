package com.alumni.platform.booking.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "bookings", indexes = {
    @Index(name = "idx_bookings_student", columnList = "student_id"),
    @Index(name = "idx_bookings_alumni", columnList = "alumni_id"),
    @Index(name = "idx_bookings_slot", columnList = "slot_id", unique = true),
    @Index(name = "idx_bookings_status", columnList = "status"),
    @Index(name = "idx_bookings_mentorship", columnList = "mentorship_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "student_id", nullable = false)
    private UUID studentId;

    @Column(name = "alumni_id", nullable = false)
    private UUID alumniId;

    @Column(name = "slot_id", nullable = false, unique = true)
    private UUID slotId;

    @Column(name = "mentorship_id")
    private UUID mentorshipId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private BookingStatus status = BookingStatus.PENDING;

    @Column(name = "notes", length = 2000)
    private String notes;

    @Column(name = "cancelled_by")
    private UUID cancelledBy;

    @Column(name = "cancelled_reason", length = 1000)
    private String cancelledReason;

    @Column(name = "cancelled_at")
    private Instant cancelledAt;

    @Column(name = "confirmed_at")
    private Instant confirmedAt;

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

    public enum BookingStatus {
        PENDING,
        CONFIRMED,
        CANCELLED_BY_STUDENT,
        CANCELLED_BY_ALUMNI,
        COMPLETED,
        NO_SHOW
    }
}