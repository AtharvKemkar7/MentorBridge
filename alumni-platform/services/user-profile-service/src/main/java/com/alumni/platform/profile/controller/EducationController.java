package com.alumni.platform.profile.controller;

import com.alumni.platform.profile.dto.request.EducationRequest;
import com.alumni.platform.profile.dto.response.StudentProfileResponse;
import com.alumni.platform.profile.entity.Education;
import com.alumni.platform.profile.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/profile/education")
@RequiredArgsConstructor
public class EducationController {

    private final ProfileService profileService;

    @PostMapping
    public ResponseEntity<StudentProfileResponse.EducationResponse> addEducation(
            @RequestHeader("X-User-Id") UUID userId,
            @Valid @RequestBody EducationRequest request) {
        Education education = mapToEntity(request);
        Education saved = profileService.addEducation(userId, education);
        return ResponseEntity.ok(mapToResponse(saved));
    }

    @DeleteMapping("/{educationId}")
    public ResponseEntity<Void> deleteEducation(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable UUID educationId) {
        profileService.deleteEducation(userId, educationId);
        return ResponseEntity.ok().build();
    }

    private Education mapToEntity(EducationRequest request) {
        Education education = new Education();
        education.setInstitution(request.getInstitution());
        education.setDegree(request.getDegree());
        education.setFieldOfStudy(request.getFieldOfStudy());
        education.setStartYear(request.getStartYear());
        education.setGraduationYear(request.getGraduationYear());
        education.setGrade(request.getGrade());
        education.setDescription(request.getDescription());
        education.setEducationType(request.getEducationType());
        education.setIsCurrent(request.getIsCurrent());
        return education;
    }

    private StudentProfileResponse.EducationResponse mapToResponse(Education e) {
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
}