package com.alumni.platform.profile.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "skills", indexes = {
    @Index(name = "idx_skills_student_profile", columnList = "student_profile_id"),
    @Index(name = "idx_skills_alumni_profile", columnList = "alumni_profile_id"),
    @Index(name = "idx_skills_name", columnList = "name"),
    @Index(name = "idx_skills_category", columnList = "category"),
    @Index(name = "idx_skills_proficiency", columnList = "proficiency")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Skill {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_profile_id")
    private StudentProfile studentProfile;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "alumni_profile_id")
    private AlumniProfile alumniProfile;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "category", length = 50)
    private String category;

    @Enumerated(EnumType.STRING)
    @Column(name = "proficiency", length = 20)
    private Proficiency proficiency;

    @Column(name = "years_of_experience")
    private Integer yearsOfExperience;

    @Column(name = "is_featured")
    @Builder.Default
    private Boolean isFeatured = false;

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

    public enum Proficiency {
        BEGINNER,
        INTERMEDIATE,
        ADVANCED,
        EXPERT
    }
}