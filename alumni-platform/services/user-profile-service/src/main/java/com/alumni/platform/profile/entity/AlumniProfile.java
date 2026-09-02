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
@Table(name = "alumni_profiles", indexes = {
    @Index(name = "idx_alumni_profiles_user_id", columnList = "user_id", unique = true),
    @Index(name = "idx_alumni_profiles_company", columnList = "current_company"),
    @Index(name = "idx_alumni_profiles_job_title", columnList = "job_title"),
    @Index(name = "idx_alumni_profiles_graduation_year", columnList = "graduation_year"),
    @Index(name = "idx_alumni_profiles_department", columnList = "department"),
    @Index(name = "idx_alumni_profiles_is_mentor", columnList = "is_mentor"),
    @Index(name = "idx_alumni_profiles_verification", columnList = "verification_status"),
    @Index(name = "idx_alumni_profiles_completeness", columnList = "profile_completeness")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlumniProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "user_id", nullable = false, unique = true)
    private UUID userId;

    @Column(name = "employee_id", length = 50)
    private String employeeId;

    @Column(name = "department", length = 100)
    private String department;

    @Column(name = "program", length = 100)
    private String program;

    @Column(name = "batch", length = 20)
    private String batch;

    @Column(name = "graduation_year")
    private Integer graduationYear;

    @Column(name = "current_company", length = 200)
    private String currentCompany;

    @Column(name = "job_title", length = 200)
    private String jobTitle;

    @Column(name = "industry", length = 100)
    private String industry;

    @Column(name = "total_experience_years")
    private Integer totalExperienceYears;

    @Column(name = "bio", length = 3000)
    private String bio;

    @Column(name = "linkedin_url", length = 500)
    private String linkedinUrl;

    @Column(name = "github_url", length = 500)
    private String githubUrl;

    @Column(name = "portfolio_url", length = 500)
    private String portfolioUrl;

    @Column(name = "location", length = 200)
    private String location;

    @Column(name = "is_mentor")
    @Builder.Default
    private Boolean isMentor = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status", length = 20)
    @Builder.Default
    private VerificationStatus verificationStatus = VerificationStatus.PENDING;

    @Column(name = "verified_at")
    private Instant verifiedAt;

    @Column(name = "verified_by")
    private UUID verifiedBy;

    @Column(name = "mentorship_areas", columnDefinition = "TEXT[]")
    private String[] mentorshipAreas;

    @Column(name = "max_mentees")
    @Builder.Default
    private Integer maxMentees = 3;

    @Column(name = "current_mentees_count")
    @Builder.Default
    private Integer currentMenteesCount = 0;

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
    @OneToMany(mappedBy = "alumniProfile", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private Set<Education> educations = new HashSet<>();

    @OneToMany(mappedBy = "alumniProfile", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private Set<Skill> skills = new HashSet<>();

    @OneToMany(mappedBy = "alumniProfile", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private Set<Experience> experiences = new HashSet<>();

    @OneToMany(mappedBy = "alumniProfile", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private Set<ExpertiseArea> expertiseAreas = new HashSet<>();

    public void addEducation(Education education) {
        educations.add(education);
        education.setAlumniProfile(this);
    }

    public void removeEducation(Education education) {
        educations.remove(education);
        education.setAlumniProfile(null);
    }

    public void addSkill(Skill skill) {
        skills.add(skill);
        skill.setAlumniProfile(this);
    }

    public void removeSkill(Skill skill) {
        skills.remove(skill);
        skill.setAlumniProfile(null);
    }

    public void addExperience(Experience experience) {
        experiences.add(experience);
        experience.setAlumniProfile(this);
    }

    public void removeExperience(Experience experience) {
        experiences.remove(experience);
        experience.setAlumniProfile(null);
    }

    public void addExpertiseArea(ExpertiseArea expertiseArea) {
        expertiseAreas.add(expertiseArea);
        expertiseArea.setAlumniProfile(this);
    }

    public void removeExpertiseArea(ExpertiseArea expertiseArea) {
        expertiseAreas.remove(expertiseArea);
        expertiseArea.setAlumniProfile(null);
    }

    public boolean canAcceptMoreMentees() {
        return isMentor && currentMenteesCount < maxMentees;
    }

    public enum VerificationStatus {
        PENDING,
        VERIFIED,
        REJECTED
    }
}