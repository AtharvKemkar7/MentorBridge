package com.alumni.platform.booking.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "availabilities", indexes = {
    @Index(name = "idx_availabilities_alumni", columnList = "alumni_id"),
    @Index(name = "idx_availabilities_date", columnList = "date")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Availability {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "alumni_id", nullable = false)
    private UUID alumniId;

    @Column(name = "date", nullable = false)
    private java.time.LocalDate date;

    @Column(name = "start_time", nullable = false)
    private java.time.LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private java.time.LocalTime endTime;

    @Column(name = "timezone", length = 50)
    @Builder.Default
    private String timezone = "UTC";

    @Column(name = "is_recurring")
    @Builder.Default
    private Boolean isRecurring = false;

    @Column(name = "recurrence_pattern", length = 50)
    private String recurrencePattern;

    @Column(name = "recurrence_end_date")
    private java.time.LocalDate recurrenceEndDate;

    @Column(name = "notes", length = 1000)
    private String notes;

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
}