package com.alumni.platform.profile.dto.response;

import com.alumni.platform.profile.entity.AlumniProfile;
import com.alumni.platform.profile.entity.Education;
import com.alumni.platform.profile.entity.Skill;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;

@Data
@Builder
public class AlumniProfileResponse {

    private UUID id;
    private UUID userId;
    private String employeeId;
    private String department;
    private String program;
    private String batch;
    private Integer graduationYear;
    private String currentCompany;
    private String jobTitle;
    private String industry;
    private Integer totalExperienceYears;
    private String bio;
    private String linkedinUrl;
    private String githubUrl;
    private String portfolioUrl;
    private String location;
    private Boolean isMentor;
    private AlumniProfile.VerificationStatus verificationStatus;
    private Instant verifiedAt;
    private String[] mentorshipAreas;
    private Integer maxMentees;
    private Integer currentMenteesCount;
    private Integer profileCompleteness;
    private Boolean isPublic;
    private Set<EducationResponse> educations;
    private Set<SkillResponse> skills;
    private Set<ExperienceResponse> experiences;
    private Set<ExpertiseAreaResponse> expertiseAreas;
    private Instant createdAt;
    private Instant updatedAt;

    @Data
    @Builder
    public static class EducationResponse {
        private UUID id;
        private String institution;
        private String degree;
        private String fieldOfStudy;
        private Integer startYear;
        private Integer graduationYear;
        private String grade;
        private String description;
        private Education.EducationType educationType;
        private Boolean isCurrent;
    }

    @Data
    @Builder
    public static class SkillResponse {
        private UUID id;
        private String name;
        private String category;
        private Skill.Proficiency proficiency;
        private Integer yearsOfExperience;
        private Boolean isFeatured;
    }

    @Data
    @Builder
    public static class ExperienceResponse {
        private UUID id;
        private String company;
        private String jobTitle;
        private String location;
        private String employmentType;
        private java.time.LocalDate startDate;
        private java.time.LocalDate endDate;
        private Boolean isCurrent;
        private String description;
        private String achievements;
        private Integer durationMonths;
    }

    @Data
    @Builder
    public static class ExpertiseAreaResponse {
        private UUID id;
        private String name;
        private String category;
        private String description;
        private Integer yearsOfExperience;
        private Boolean isMentoringArea;
    }
}