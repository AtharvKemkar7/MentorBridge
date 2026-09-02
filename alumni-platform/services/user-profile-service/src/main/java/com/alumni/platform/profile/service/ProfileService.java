package com.alumni.platform.profile.service;

import com.alumni.platform.profile.dto.request.StudentProfileRequest;
import com.alumni.platform.profile.dto.request.AlumniProfileRequest;
import com.alumni.platform.profile.dto.response.StudentProfileResponse;
import com.alumni.platform.profile.dto.response.AlumniProfileResponse;
import com.alumni.platform.profile.entity.StudentProfile;
import com.alumni.platform.profile.entity.AlumniProfile;
import com.alumni.platform.profile.entity.Education;
import com.alumni.platform.profile.entity.Skill;
import com.alumni.platform.profile.entity.Experience;
import com.alumni.platform.profile.entity.CareerInterest;
import com.alumni.platform.profile.entity.ExpertiseArea;
import com.alumni.platform.profile.exception.ProfileNotFoundException;
import com.alumni.platform.profile.exception.ProfileAlreadyExistsException;
import com.alumni.platform.profile.repository.StudentProfileRepository;
import com.alumni.platform.profile.repository.AlumniProfileRepository;
import com.alumni.platform.profile.repository.EducationRepository;
import com.alumni.platform.profile.repository.SkillRepository;
import com.alumni.platform.profile.repository.ExperienceRepository;
import com.alumni.platform.profile.repository.CareerInterestRepository;
import com.alumni.platform.profile.repository.ExpertiseAreaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProfileService {

    private final StudentProfileRepository studentProfileRepository;
    private final AlumniProfileRepository alumniProfileRepository;
    private final EducationRepository educationRepository;
    private final SkillRepository skillRepository;
    private final ExperienceRepository experienceRepository;
    private final CareerInterestRepository careerInterestRepository;
    private final ExpertiseAreaRepository expertiseAreaRepository;

    // Student Profile Methods
    @Transactional
    public StudentProfileResponse createStudentProfile(UUID userId, StudentProfileRequest request) {
        log.info("Creating student profile for user: {}", userId);

        if (studentProfileRepository.existsByUserId(userId)) {
            throw new ProfileAlreadyExistsException("Student profile already exists for user: " + userId);
        }

        if (request.getStudentId() != null && studentProfileRepository.existsByStudentId(request.getStudentId())) {
            throw new ProfileAlreadyExistsException("Student ID already exists: " + request.getStudentId());
        }

        StudentProfile profile = StudentProfile.builder()
                .userId(userId)
                .studentId(request.getStudentId())
                .department(request.getDepartment())
                .program(request.getProgram())
                .batch(request.getBatch())
                .graduationYear(request.getGraduationYear())
                .currentSemester(request.getCurrentSemester())
                .cgpa(request.getCgpa())
                .bio(request.getBio())
                .linkedinUrl(request.getLinkedinUrl())
                .githubUrl(request.getGithubUrl())
                .portfolioUrl(request.getPortfolioUrl())
                .location(request.getLocation())
                .willingToRelocate(request.getWillingToRelocate())
                .isPublic(request.getIsPublic())
                .build();

        profile = studentProfileRepository.save(profile);
        updateProfileCompleteness(profile);

        log.info("Created student profile: {}", profile.getId());
        return mapToStudentProfileResponse(profile);
    }

    @Transactional
    public StudentProfileResponse updateStudentProfile(UUID userId, StudentProfileRequest request) {
        log.info("Updating student profile for user: {}", userId);

        StudentProfile profile = studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ProfileNotFoundException("Student profile not found for user: " + userId));

        if (request.getStudentId() != null && !request.getStudentId().equals(profile.getStudentId())) {
            if (studentProfileRepository.existsByStudentId(request.getStudentId())) {
                throw new ProfileAlreadyExistsException("Student ID already exists: " + request.getStudentId());
            }
            profile.setStudentId(request.getStudentId());
        }

        if (request.getDepartment() != null) profile.setDepartment(request.getDepartment());
        if (request.getProgram() != null) profile.setProgram(request.getProgram());
        if (request.getBatch() != null) profile.setBatch(request.getBatch());
        if (request.getGraduationYear() != null) profile.setGraduationYear(request.getGraduationYear());
        if (request.getCurrentSemester() != null) profile.setCurrentSemester(request.getCurrentSemester());
        if (request.getCgpa() != null) profile.setCgpa(request.getCgpa());
        if (request.getBio() != null) profile.setBio(request.getBio());
        if (request.getLinkedinUrl() != null) profile.setLinkedinUrl(request.getLinkedinUrl());
        if (request.getGithubUrl() != null) profile.setGithubUrl(request.getGithubUrl());
        if (request.getPortfolioUrl() != null) profile.setPortfolioUrl(request.getPortfolioUrl());
        if (request.getLocation() != null) profile.setLocation(request.getLocation());
        if (request.getWillingToRelocate() != null) profile.setWillingToRelocate(request.getWillingToRelocate());
        if (request.getIsPublic() != null) profile.setIsPublic(request.getIsPublic());

        profile = studentProfileRepository.save(profile);
        updateProfileCompleteness(profile);

        log.info("Updated student profile: {}", profile.getId());
        return mapToStudentProfileResponse(profile);
    }

    @Transactional(readOnly = true)
    public StudentProfileResponse getStudentProfile(UUID userId) {
        StudentProfile profile = studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ProfileNotFoundException("Student profile not found for user: " + userId));
        return mapToStudentProfileResponse(profile);
    }

    @Transactional(readOnly = true)
    public StudentProfileResponse getStudentProfileById(UUID profileId) {
        StudentProfile profile = studentProfileRepository.findById(profileId)
                .orElseThrow(() -> new ProfileNotFoundException("Student profile not found: " + profileId));
        return mapToStudentProfileResponse(profile);
    }

    // Alumni Profile Methods
    @Transactional
    public AlumniProfileResponse createAlumniProfile(UUID userId, AlumniProfileRequest request) {
        log.info("Creating alumni profile for user: {}", userId);

        if (alumniProfileRepository.existsByUserId(userId)) {
            throw new ProfileAlreadyExistsException("Alumni profile already exists for user: " + userId);
        }

        if (request.getEmployeeId() != null && alumniProfileRepository.existsByEmployeeId(request.getEmployeeId())) {
            throw new ProfileAlreadyExistsException("Employee ID already exists: " + request.getEmployeeId());
        }

        AlumniProfile profile = AlumniProfile.builder()
                .userId(userId)
                .employeeId(request.getEmployeeId())
                .department(request.getDepartment())
                .program(request.getProgram())
                .batch(request.getBatch())
                .graduationYear(request.getGraduationYear())
                .currentCompany(request.getCurrentCompany())
                .jobTitle(request.getJobTitle())
                .industry(request.getIndustry())
                .totalExperienceYears(request.getTotalExperienceYears())
                .bio(request.getBio())
                .linkedinUrl(request.getLinkedinUrl())
                .githubUrl(request.getGithubUrl())
                .portfolioUrl(request.getPortfolioUrl())
                .location(request.getLocation())
                .isMentor(request.getIsMentor())
                .maxMentees(request.getMaxMentees())
                .mentorshipAreas(request.getMentorshipAreas())
                .isPublic(request.getIsPublic())
                .build();

        profile = alumniProfileRepository.save(profile);
        updateAlumniProfileCompleteness(profile);

        log.info("Created alumni profile: {}", profile.getId());
        return mapToAlumniProfileResponse(profile);
    }

    @Transactional
    public AlumniProfileResponse updateAlumniProfile(UUID userId, AlumniProfileRequest request) {
        log.info("Updating alumni profile for user: {}", userId);

        AlumniProfile profile = alumniProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ProfileNotFoundException("Alumni profile not found for user: " + userId));

        if (request.getEmployeeId() != null && !request.getEmployeeId().equals(profile.getEmployeeId())) {
            if (alumniProfileRepository.existsByEmployeeId(request.getEmployeeId())) {
                throw new ProfileAlreadyExistsException("Employee ID already exists: " + request.getEmployeeId());
            }
            profile.setEmployeeId(request.getEmployeeId());
        }

        if (request.getDepartment() != null) profile.setDepartment(request.getDepartment());
        if (request.getProgram() != null) profile.setProgram(request.getProgram());
        if (request.getBatch() != null) profile.setBatch(request.getBatch());
        if (request.getGraduationYear() != null) profile.setGraduationYear(request.getGraduationYear());
        if (request.getCurrentCompany() != null) profile.setCurrentCompany(request.getCurrentCompany());
        if (request.getJobTitle() != null) profile.setJobTitle(request.getJobTitle());
        if (request.getIndustry() != null) profile.setIndustry(request.getIndustry());
        if (request.getTotalExperienceYears() != null) profile.setTotalExperienceYears(request.getTotalExperienceYears());
        if (request.getBio() != null) profile.setBio(request.getBio());
        if (request.getLinkedinUrl() != null) profile.setLinkedinUrl(request.getLinkedinUrl());
        if (request.getGithubUrl() != null) profile.setGithubUrl(request.getGithubUrl());
        if (request.getPortfolioUrl() != null) profile.setPortfolioUrl(request.getPortfolioUrl());
        if (request.getLocation() != null) profile.setLocation(request.getLocation());
        if (request.getIsMentor() != null) profile.setIsMentor(request.getIsMentor());
        if (request.getMaxMentees() != null) profile.setMaxMentees(request.getMaxMentees());
        if (request.getMentorshipAreas() != null) profile.setMentorshipAreas(request.getMentorshipAreas());
        if (request.getIsPublic() != null) profile.setIsPublic(request.getIsPublic());

        profile = alumniProfileRepository.save(profile);
        updateAlumniProfileCompleteness(profile);

        log.info("Updated alumni profile: {}", profile.getId());
        return mapToAlumniProfileResponse(profile);
    }

    @Transactional(readOnly = true)
    public AlumniProfileResponse getAlumniProfile(UUID userId) {
        AlumniProfile profile = alumniProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ProfileNotFoundException("Alumni profile not found for user: " + userId));
        return mapToAlumniProfileResponse(profile);
    }

    @Transactional(readOnly = true)
    public AlumniProfileResponse getAlumniProfileById(UUID profileId) {
        AlumniProfile profile = alumniProfileRepository.findById(profileId)
                .orElseThrow(() -> new ProfileNotFoundException("Alumni profile not found: " + profileId));
        return mapToAlumniProfileResponse(profile);
    }

    // Education Methods
    @Transactional
    public Education addEducation(UUID userId, Education education) {
        boolean isStudent = studentProfileRepository.existsByUserId(userId);
        if (isStudent) {
            StudentProfile profile = studentProfileRepository.findByUserId(userId).orElseThrow();
            education.setStudentProfile(profile);
        } else {
            AlumniProfile profile = alumniProfileRepository.findByUserId(userId).orElseThrow();
            education.setAlumniProfile(profile);
        }
        return educationRepository.save(education);
    }

    @Transactional
    public void deleteEducation(UUID userId, UUID educationId) {
        Education education = educationRepository.findById(educationId)
                .orElseThrow(() -> new ProfileNotFoundException("Education not found: " + educationId));
        educationRepository.delete(education);
    }

    // Skill Methods
    @Transactional
    public Skill addSkill(UUID userId, Skill skill) {
        boolean isStudent = studentProfileRepository.existsByUserId(userId);
        if (isStudent) {
            StudentProfile profile = studentProfileRepository.findByUserId(userId).orElseThrow();
            skill.setStudentProfile(profile);
        } else {
            AlumniProfile profile = alumniProfileRepository.findByUserId(userId).orElseThrow();
            skill.setAlumniProfile(profile);
        }
        return skillRepository.save(skill);
    }

    @Transactional
    public void deleteSkill(UUID userId, UUID skillId) {
        Skill skill = skillRepository.findById(skillId)
                .orElseThrow(() -> new ProfileNotFoundException("Skill not found: " + skillId));
        skillRepository.delete(skill);
    }

    // Experience Methods (Alumni only)
    @Transactional
    public Experience addExperience(UUID userId, Experience experience) {
        AlumniProfile profile = alumniProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ProfileNotFoundException("Alumni profile not found for user: " + userId));
        experience.setAlumniProfile(profile);
        return experienceRepository.save(experience);
    }

    @Transactional
    public void deleteExperience(UUID userId, UUID experienceId) {
        Experience experience = experienceRepository.findById(experienceId)
                .orElseThrow(() -> new ProfileNotFoundException("Experience not found: " + experienceId));
        experienceRepository.delete(experience);
    }

    // Career Interest Methods (Student only)
    @Transactional
    public CareerInterest addCareerInterest(UUID userId, CareerInterest careerInterest) {
        StudentProfile profile = studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ProfileNotFoundException("Student profile not found for user: " + userId));
        careerInterest.setStudentProfile(profile);
        return careerInterestRepository.save(careerInterest);
    }

    @Transactional
    public void deleteCareerInterest(UUID userId, UUID careerInterestId) {
        CareerInterest careerInterest = careerInterestRepository.findById(careerInterestId)
                .orElseThrow(() -> new ProfileNotFoundException("Career interest not found: " + careerInterestId));
        careerInterestRepository.delete(careerInterest);
    }

    // Expertise Area Methods (Alumni only)
    @Transactional
    public ExpertiseArea addExpertiseArea(UUID userId, ExpertiseArea expertiseArea) {
        AlumniProfile profile = alumniProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ProfileNotFoundException("Alumni profile not found for user: " + userId));
        expertiseArea.setAlumniProfile(profile);
        return expertiseAreaRepository.save(expertiseArea);
    }

    @Transactional
    public void deleteExpertiseArea(UUID userId, UUID expertiseAreaId) {
        ExpertiseArea expertiseArea = expertiseAreaRepository.findById(expertiseAreaId)
                .orElseThrow(() -> new ProfileNotFoundException("Expertise area not found: " + expertiseAreaId));
        expertiseAreaRepository.delete(expertiseArea);
    }

    private void updateProfileCompleteness(StudentProfile profile) {
        int completeness = 0;
        if (profile.getStudentId() != null) completeness += 10;
        if (profile.getDepartment() != null) completeness += 10;
        if (profile.getProgram() != null) completeness += 10;
        if (profile.getGraduationYear() != null) completeness += 10;
        if (profile.getBio() != null && !profile.getBio().isBlank()) completeness += 15;
        if (profile.getLinkedinUrl() != null) completeness += 10;
        if (profile.getLocation() != null) completeness += 10;
        if (!profile.getEducations().isEmpty()) completeness += 15;
        if (!profile.getSkills().isEmpty()) completeness += 10;
        if (!profile.getCareerInterests().isEmpty()) completeness += 10;

        profile.setProfileCompleteness(Math.min(completeness, 100));
        studentProfileRepository.save(profile);
    }

    private void updateAlumniProfileCompleteness(AlumniProfile profile) {
        int completeness = 0;
        if (profile.getEmployeeId() != null) completeness += 10;
        if (profile.getDepartment() != null) completeness += 10;
        if (profile.getGraduationYear() != null) completeness += 10;
        if (profile.getCurrentCompany() != null) completeness += 15;
        if (profile.getJobTitle() != null) completeness += 10;
        if (profile.getBio() != null && !profile.getBio().isBlank()) completeness += 15;
        if (profile.getLinkedinUrl() != null) completeness += 10;
        if (profile.getLocation() != null) completeness += 10;
        if (!profile.getEducations().isEmpty()) completeness += 10;
        if (!profile.getSkills().isEmpty()) completeness += 10;
        if (!profile.getExperiences().isEmpty()) completeness += 10;
        if (!profile.getExpertiseAreas().isEmpty()) completeness += 10;

        profile.setProfileCompleteness(Math.min(completeness, 100));
        alumniProfileRepository.save(profile);
    }

    private StudentProfileResponse mapToStudentProfileResponse(StudentProfile profile) {
        return StudentProfileResponse.builder()
                .id(profile.getId())
                .userId(profile.getUserId())
                .studentId(profile.getStudentId())
                .department(profile.getDepartment())
                .program(profile.getProgram())
                .batch(profile.getBatch())
                .graduationYear(profile.getGraduationYear())
                .currentSemester(profile.getCurrentSemester())
                .cgpa(profile.getCgpa())
                .bio(profile.getBio())
                .linkedinUrl(profile.getLinkedinUrl())
                .githubUrl(profile.getGithubUrl())
                .portfolioUrl(profile.getPortfolioUrl())
                .location(profile.getLocation())
                .willingToRelocate(profile.getWillingToRelocate())
                .profileCompleteness(profile.getProfileCompleteness())
                .isPublic(profile.getIsPublic())
                .educations(profile.getEducations().stream().map(this::mapStudentEducation).collect(Collectors.toSet()))
                .skills(profile.getSkills().stream().map(this::mapSkill).collect(Collectors.toSet()))
                .careerInterests(profile.getCareerInterests().stream().map(this::mapCareerInterest).collect(Collectors.toSet()))
                .createdAt(profile.getCreatedAt())
                .updatedAt(profile.getUpdatedAt())
                .build();
    }

    AlumniProfileResponse mapToAlumniProfileResponse(AlumniProfile profile) {
        return AlumniProfileResponse.builder()
                .id(profile.getId())
                .userId(profile.getUserId())
                .employeeId(profile.getEmployeeId())
                .department(profile.getDepartment())
                .program(profile.getProgram())
                .batch(profile.getBatch())
                .graduationYear(profile.getGraduationYear())
                .currentCompany(profile.getCurrentCompany())
                .jobTitle(profile.getJobTitle())
                .industry(profile.getIndustry())
                .totalExperienceYears(profile.getTotalExperienceYears())
                .bio(profile.getBio())
                .linkedinUrl(profile.getLinkedinUrl())
                .githubUrl(profile.getGithubUrl())
                .portfolioUrl(profile.getPortfolioUrl())
                .location(profile.getLocation())
                .isMentor(profile.getIsMentor())
                .verificationStatus(profile.getVerificationStatus())
                .verifiedAt(profile.getVerifiedAt())
                .mentorshipAreas(profile.getMentorshipAreas())
                .maxMentees(profile.getMaxMentees())
                .currentMenteesCount(profile.getCurrentMenteesCount())
                .profileCompleteness(profile.getProfileCompleteness())
                .isPublic(profile.getIsPublic())
                .educations(profile.getEducations().stream().map(this::mapAlumniEducation).collect(Collectors.toSet()))
                .skills(profile.getSkills().stream().map(this::mapAlumniSkill).collect(Collectors.toSet()))
                .experiences(profile.getExperiences().stream().map(this::mapExperience).collect(Collectors.toSet()))
                .expertiseAreas(profile.getExpertiseAreas().stream().map(this::mapExpertiseArea).collect(Collectors.toSet()))
                .createdAt(profile.getCreatedAt())
                .updatedAt(profile.getUpdatedAt())
                .build();
    }

    private StudentProfileResponse.EducationResponse mapStudentEducation(Education e) {
        return StudentProfileResponse.EducationResponse.builder()
                .id(e.getId())
                .institution(e.getInstitution())
                .degree(e.getDegree())
                .fieldOfStudy(e.getFieldOfStudy())
                .startYear(e.getStartYear())
                .graduationYear(e.getGraduationYear())
                .grade(e.getGrade())
                .description(e.getDescription())
                .educationType(e.getEducationType())
                .isCurrent(e.getIsCurrent())
                .build();
    }

    private AlumniProfileResponse.EducationResponse mapAlumniEducation(Education e) {
        return AlumniProfileResponse.EducationResponse.builder()
                .id(e.getId())
                .institution(e.getInstitution())
                .degree(e.getDegree())
                .fieldOfStudy(e.getFieldOfStudy())
                .startYear(e.getStartYear())
                .graduationYear(e.getGraduationYear())
                .grade(e.getGrade())
                .description(e.getDescription())
                .educationType(e.getEducationType())
                .isCurrent(e.getIsCurrent())
                .build();
    }

    private StudentProfileResponse.SkillResponse mapSkill(Skill s) {
        return StudentProfileResponse.SkillResponse.builder()
                .id(s.getId())
                .name(s.getName())
                .category(s.getCategory())
                .proficiency(s.getProficiency())
                .yearsOfExperience(s.getYearsOfExperience())
                .isFeatured(s.getIsFeatured())
                .build();
    }

    private AlumniProfileResponse.SkillResponse mapAlumniSkill(Skill s) {
        return AlumniProfileResponse.SkillResponse.builder()
                .id(s.getId())
                .name(s.getName())
                .category(s.getCategory())
                .proficiency(s.getProficiency())
                .yearsOfExperience(s.getYearsOfExperience())
                .isFeatured(s.getIsFeatured())
                .build();
    }

    private StudentProfileResponse.CareerInterestResponse mapCareerInterest(CareerInterest ci) {
        return StudentProfileResponse.CareerInterestResponse.builder()
                .id(ci.getId())
                .desiredRole(ci.getDesiredRole())
                .industry(ci.getIndustry())
                .preferredLocations(ci.getPreferredLocations())
                .remotePreference(ci.getRemotePreference())
                .expectedSalaryMin(ci.getExpectedSalaryMin())
                .expectedSalaryMax(ci.getExpectedSalaryMax())
                .notes(ci.getNotes())
                .priority(ci.getPriority())
                .build();
    }

    private AlumniProfileResponse.ExperienceResponse mapExperience(Experience e) {
        return AlumniProfileResponse.ExperienceResponse.builder()
                .id(e.getId())
                .company(e.getCompany())
                .jobTitle(e.getJobTitle())
                .location(e.getLocation())
                .employmentType(e.getEmploymentType())
                .startDate(e.getStartDate())
                .endDate(e.getEndDate())
                .isCurrent(e.getIsCurrent())
                .description(e.getDescription())
                .achievements(e.getAchievements())
                .durationMonths(e.getDurationMonths())
                .build();
    }

    private AlumniProfileResponse.ExpertiseAreaResponse mapExpertiseArea(ExpertiseArea ea) {
        return AlumniProfileResponse.ExpertiseAreaResponse.builder()
                .id(ea.getId())
                .name(ea.getName())
                .category(ea.getCategory())
                .description(ea.getDescription())
                .yearsOfExperience(ea.getYearsOfExperience())
                .isMentoringArea(ea.getIsMentoringArea())
                .build();
    }
}