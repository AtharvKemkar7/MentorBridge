package com.alumni.platform.profile.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "educations", indexes = {
    @Index(name = "idx_educations_student_profile", columnList = "student_profile_id"),
    @Index(name = "idx_educations_alumni_profile", columnList = "alumni_profile_id"),
    @Index(name = "idx_educations_institution", columnList = "institution"),
    @Index(name = "idx_educations_graduation_year", columnList = "graduation_year")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Education {

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

    @Column(name = "institution", nullable = false, length = 200)
    private String institution;

    @Column(name = "degree", length = 100)
    private String degree;

    @Column(name = "field_of_study", length = 100)
    private String fieldOfStudy;

    @Column(name = "start_year")
    private Integer startYear;

    @Column(name = "graduation_year")
    private Integer graduationYear;

    @Column(name = "grade", length = 20)
    private String grade;

    @Column(name = "description", length = 1000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "education_type", length = 20)
    private EducationType educationType;

    @Column(name = "is_current")
    @Builder.Default
    private Boolean isCurrent = false;

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

    public enum EducationType {
        DEGREE,
        CERTIFICATION,
        COURSE,
        WORKSHOP,
        OTHER
    }
}