package com.alumni.platform.profile.controller;

import com.alumni.platform.profile.dto.request.CareerInterestRequest;
import com.alumni.platform.profile.dto.response.StudentProfileResponse;
import com.alumni.platform.profile.entity.CareerInterest;
import com.alumni.platform.profile.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/student/profile/career-interests")
@RequiredArgsConstructor
public class CareerInterestController {

    private final ProfileService profileService;

    @PostMapping
    public ResponseEntity<StudentProfileResponse.CareerInterestResponse> addCareerInterest(
            @RequestHeader("X-User-Id") UUID userId,
            @Valid @RequestBody CareerInterestRequest request) {
        CareerInterest ci = mapToEntity(request);
        CareerInterest saved = profileService.addCareerInterest(userId, ci);
        return ResponseEntity.ok(mapToResponse(saved));
    }

    @DeleteMapping("/{careerInterestId}")
    public ResponseEntity<Void> deleteCareerInterest(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable UUID careerInterestId) {
        profileService.deleteCareerInterest(userId, careerInterestId);
        return ResponseEntity.ok().build();
    }

    private CareerInterest mapToEntity(CareerInterestRequest request) {
        CareerInterest ci = new CareerInterest();
        ci.setDesiredRole(request.getDesiredRole());
        ci.setIndustry(request.getIndustry());
        ci.setPreferredLocations(request.getPreferredLocations());
        ci.setRemotePreference(request.getRemotePreference());
        ci.setExpectedSalaryMin(request.getExpectedSalaryMin());
        ci.setExpectedSalaryMax(request.getExpectedSalaryMax());
        ci.setNotes(request.getNotes());
        ci.setPriority(request.getPriority());
        return ci;
    }

    private StudentProfileResponse.CareerInterestResponse mapToResponse(CareerInterest ci) {
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
}