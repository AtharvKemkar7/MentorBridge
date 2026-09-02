package com.alumni.platform.profile.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "experiences", indexes = {
    @Index(name = "idx_experiences_alumni_profile", columnList = "alumni_profile_id"),
    @Index(name = "idx_experiences_company", columnList = "company"),
    @Index(name = "idx_experiences_start_date", columnList = "start_date"),
    @Index(name = "idx_experiences_is_current", columnList = "is_current")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Experience {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "alumni_profile_id", nullable = false)
    private AlumniProfile alumniProfile;

    @Column(name = "company", nullable = false, length = 200)
    private String company;

    @Column(name = "job_title", nullable = false, length = 200)
    private String jobTitle;

    @Column(name = "location", length = 200)
    private String location;

    @Column(name = "employment_type", length = 30)
    private String employmentType;

    @Column(name = "start_date", nullable = false)
    private java.time.LocalDate startDate;

    @Column(name = "end_date")
    private java.time.LocalDate endDate;

    @Column(name = "is_current")
    @Builder.Default
    private Boolean isCurrent = false;

    @Column(name = "description", length = 3000)
    private String description;

    @Column(name = "achievements", length = 3000)
    private String achievements;

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

    public int getDurationMonths() {
        java.time.LocalDate end = endDate != null ? endDate : java.time.LocalDate.now();
        return (int) java.time.temporal.ChronoUnit.MONTHS.between(startDate, end);
    }
}