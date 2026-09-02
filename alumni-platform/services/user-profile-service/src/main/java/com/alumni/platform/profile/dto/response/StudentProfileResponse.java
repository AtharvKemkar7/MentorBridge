package com.alumni.platform.profile.dto.response;

import com.alumni.platform.profile.entity.Education;
import com.alumni.platform.profile.entity.Skill;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Set;
import java.util.UUID;

@Data
@Builder
public class StudentProfileResponse {

    private UUID id;
    private UUID userId;
    private String studentId;
    private String department;
    private String program;
    private String batch;
    private Integer graduationYear;
    private Integer currentSemester;
    private BigDecimal cgpa;
    private String bio;
    private String linkedinUrl;
    private String githubUrl;
    private String portfolioUrl;
    private String location;
    private Boolean willingToRelocate;
    private Integer profileCompleteness;
    private Boolean isPublic;
    private Set<EducationResponse> educations;
    private Set<SkillResponse> skills;
    private Set<CareerInterestResponse> careerInterests;
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
    public static class CareerInterestResponse {
        private UUID id;
        private String desiredRole;
        private String industry;
        private String[] preferredLocations;
        private String remotePreference;
        private Long expectedSalaryMin;
        private Long expectedSalaryMax;
        private String notes;
        private Integer priority;
    }
}