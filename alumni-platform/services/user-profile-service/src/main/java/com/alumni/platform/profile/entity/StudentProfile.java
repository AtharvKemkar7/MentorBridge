package com.alumni.platform.profile.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "student_profiles", indexes = {
    @Index(name = "idx_student_profiles_user_id", columnList = "user_id", unique = true),
    @Index(name = "idx_student_profiles_graduation_year", columnList = "graduation_year"),
    @Index(name = "idx_student_profiles_department", columnList = "department"),
    @Index(name = "idx_student_profiles_completeness", columnList = "profile_completeness")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "user_id", nullable = false, unique = true)
    private UUID userId;

    @Column(name = "student_id", length = 50)
    private String studentId;

    @Column(name = "department", length = 100)
    private String department;

    @Column(name = "program", length = 100)
    private String program;

    @Column(name = "batch", length = 20)
    private String batch;

    @Column(name = "graduation_year")
    private Integer graduationYear;

    @Column(name = "current_semester")
    private Integer currentSemester;

    @Column(name = "cgpa", precision = 3, scale = 2)
    private java.math.BigDecimal cgpa;

    @Column(name = "bio", length = 2000)
    private String bio;

    @Column(name = "linkedin_url", length = 500)
    private String linkedinUrl;

    @Column(name = "github_url", length = 500)
    private String githubUrl;

    @Column(name = "portfolio_url", length = 500)
    private String portfolioUrl;

    @Column(name = "location", length = 200)
    private String location;

    @Column(name = "willing_to_relocate")
    @Builder.Default
    private Boolean willingToRelocate = false;

    @Column(name = "profile_completeness")
    @Builder.Default
    private Integer profileCompleteness = 0;

    @Column(name = "is_public")
    @Builder.Default
    private Boolean isPublic = true;

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

    // Relationships
    @OneToMany(mappedBy = "studentProfile", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private Set<Education> educations = new HashSet<>();

    @OneToMany(mappedBy = "studentProfile", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private Set<Skill> skills = new HashSet<>();

    @OneToMany(mappedBy = "studentProfile", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private Set<CareerInterest> careerInterests = new HashSet<>();

    public void addEducation(Education education) {
        educations.add(education);
        education.setStudentProfile(this);
    }

    public void removeEducation(Education education) {
        educations.remove(education);
        education.setStudentProfile(null);
    }

    public void addSkill(Skill skill) {
        skills.add(skill);
        skill.setStudentProfile(this);
    }

    public void removeSkill(Skill skill) {
        skills.remove(skill);
        skill.setStudentProfile(null);
    }

    public void addCareerInterest(CareerInterest careerInterest) {
        careerInterests.add(careerInterest);
        careerInterest.setStudentProfile(this);
    }

    public void removeCareerInterest(CareerInterest careerInterest) {
        careerInterests.remove(careerInterest);
        careerInterest.setStudentProfile(null);
    }
}