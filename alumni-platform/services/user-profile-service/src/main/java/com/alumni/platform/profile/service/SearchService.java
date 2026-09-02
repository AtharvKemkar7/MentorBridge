package com.alumni.platform.profile.service;

import com.alumni.platform.profile.dto.response.AlumniProfileResponse;
import com.alumni.platform.profile.entity.AlumniProfile;
import com.alumni.platform.profile.repository.AlumniProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SearchService {

    private final AlumniProfileRepository alumniProfileRepository;
    private final ProfileService profileService;

    @Transactional(readOnly = true)
    public Page<AlumniProfileResponse> searchMentors(String company, String jobTitle, String industry,
                                                      Integer graduationYear, String department,
                                                      String skill, String expertise,
                                                      Pageable pageable) {
        log.debug("Searching mentors with filters: company={}, jobTitle={}, industry={}, graduationYear={}, department={}, skill={}, expertise={}",
                company, jobTitle, industry, graduationYear, department, skill, expertise);

        Page<AlumniProfile> mentors = alumniProfileRepository.searchMentors(
                company, jobTitle, industry, graduationYear, department, skill, expertise, pageable);

        return mentors.map(profileService::mapToAlumniProfileResponse);
    }

    @Transactional(readOnly = true)
    public Page<AlumniProfileResponse> searchAlumni(String company, String jobTitle, String industry,
                                                     Integer graduationYear, String department,
                                                     String skill, Pageable pageable) {
        log.debug("Searching alumni with filters: company={}, jobTitle={}, industry={}, graduationYear={}, department={}, skill={}",
                company, jobTitle, industry, graduationYear, department, skill);

        Page<AlumniProfile> alumni = alumniProfileRepository.searchAlumni(
                company, jobTitle, industry, graduationYear, department, skill, pageable);

        return alumni.map(profileService::mapToAlumniProfileResponse);
    }

    @Transactional(readOnly = true)
    public List<AlumniProfileResponse> getRecommendedMentors(UUID studentId, int limit) {
        // TODO: Implement recommendation logic based on student's career interests, skills, etc.
        // For now, return verified mentors with availability
        Page<AlumniProfile> mentors = alumniProfileRepository.searchMentors(
                null, null, null, null, null, null, null,
                Pageable.ofSize(limit));

        return mentors.getContent().stream()
                .map(profileService::mapToAlumniProfileResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<String> getSkillSuggestions(String query) {
        // TODO: Implement skill autocomplete/suggestions
        return List.of();
    }

    @Transactional(readOnly = true)
    public List<String> getCompanySuggestions(String query) {
        // TODO: Implement company autocomplete/suggestions
        return List.of();
    }
}