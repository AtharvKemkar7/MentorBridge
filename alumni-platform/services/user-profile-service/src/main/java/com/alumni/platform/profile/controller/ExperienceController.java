package com.alumni.platform.profile.controller;

import com.alumni.platform.profile.dto.request.ExperienceRequest;
import com.alumni.platform.profile.dto.response.AlumniProfileResponse;
import com.alumni.platform.profile.entity.Experience;
import com.alumni.platform.profile.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/alumni/profile/experience")
@RequiredArgsConstructor
public class ExperienceController {

    private final ProfileService profileService;

    @PostMapping
    public ResponseEntity<AlumniProfileResponse.ExperienceResponse> addExperience(
            @RequestHeader("X-User-Id") UUID userId,
            @Valid @RequestBody ExperienceRequest request) {
        Experience experience = mapToEntity(request);
        Experience saved = profileService.addExperience(userId, experience);
        return ResponseEntity.ok(mapToResponse(saved));
    }

    @DeleteMapping("/{experienceId}")
    public ResponseEntity<Void> deleteExperience(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable UUID experienceId) {
        profileService.deleteExperience(userId, experienceId);
        return ResponseEntity.ok().build();
    }

    private Experience mapToEntity(ExperienceRequest request) {
        Experience experience = new Experience();
        experience.setCompany(request.getCompany());
        experience.setJobTitle(request.getJobTitle());
        experience.setLocation(request.getLocation());
        experience.setEmploymentType(request.getEmploymentType());
        experience.setStartDate(request.getStartDate());
        experience.setEndDate(request.getEndDate());
        experience.setIsCurrent(request.getIsCurrent());
        experience.setDescription(request.getDescription());
        experience.setAchievements(request.getAchievements());
        return experience;
    }

    private AlumniProfileResponse.ExperienceResponse mapToResponse(Experience e) {
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
}