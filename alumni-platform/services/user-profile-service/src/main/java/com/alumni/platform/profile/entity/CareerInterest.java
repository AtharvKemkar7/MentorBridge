package com.alumni.platform.profile.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "career_interests", indexes = {
    @Index(name = "idx_career_interests_student_profile", columnList = "student_profile_id"),
    @Index(name = "idx_career_interests_role", columnList = "desired_role"),
    @Index(name = "idx_career_interests_industry", columnList = "industry")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CareerInterest {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_profile_id", nullable = false)
    private StudentProfile studentProfile;

    @Column(name = "desired_role", length = 100)
    private String desiredRole;

    @Column(name = "industry", length = 100)
    private String industry;

    @Column(name = "preferred_locations", columnDefinition = "TEXT[]")
    private String[] preferredLocations;

    @Column(name = "remote_preference", length = 20)
    private String remotePreference;

    @Column(name = "expected_salary_min")
    private Long expectedSalaryMin;

    @Column(name = "expected_salary_max")
    private Long expectedSalaryMax;

    @Column(name = "notes", length = 1000)
    private String notes;

    @Column(name = "priority")
    @Builder.Default
    private Integer priority = 1;

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