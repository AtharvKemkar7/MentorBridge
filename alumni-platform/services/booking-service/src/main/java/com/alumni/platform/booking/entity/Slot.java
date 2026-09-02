package com.alumni.platform.booking.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "slots", indexes = {
    @Index(name = "idx_slots_availability", columnList = "availability_id"),
    @Index(name = "idx_slots_alumni", columnList = "alumni_id"),
    @Index(name = "idx_slots_start_time", columnList = "start_time"),
    @Index(name = "idx_slots_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Slot {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "availability_id", nullable = false)
    private UUID availabilityId;

    @Column(name = "alumni_id", nullable = false)
    private UUID alumniId;

    @Column(name = "start_time", nullable = false)
    private java.time.ZonedDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private java.time.ZonedDateTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private SlotStatus status = SlotStatus.AVAILABLE;

    @Column(name = "booked_by")
    private UUID bookedBy;

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

    public enum SlotStatus {
        AVAILABLE,
        BOOKED,
        BLOCKED,
        CANCELLED
    }
}