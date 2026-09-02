package com.alumni.platform.profile.controller;

import com.alumni.platform.profile.dto.request.ExpertiseAreaRequest;
import com.alumni.platform.profile.dto.response.AlumniProfileResponse;
import com.alumni.platform.profile.entity.ExpertiseArea;
import com.alumni.platform.profile.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/alumni/profile/expertise")
@RequiredArgsConstructor
public class ExpertiseAreaController {

    private final ProfileService profileService;

    @PostMapping
    public ResponseEntity<AlumniProfileResponse.ExpertiseAreaResponse> addExpertiseArea(
            @RequestHeader("X-User-Id") UUID userId,
            @Valid @RequestBody ExpertiseAreaRequest request) {
        ExpertiseArea ea = mapToEntity(request);
        ExpertiseArea saved = profileService.addExpertiseArea(userId, ea);
        return ResponseEntity.ok(mapToResponse(saved));
    }

    @DeleteMapping("/{expertiseAreaId}")
    public ResponseEntity<Void> deleteExpertiseArea(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable UUID expertiseAreaId) {
        profileService.deleteExpertiseArea(userId, expertiseAreaId);
        return ResponseEntity.ok().build();
    }

    private ExpertiseArea mapToEntity(ExpertiseAreaRequest request) {
        ExpertiseArea ea = new ExpertiseArea();
        ea.setName(request.getName());
        ea.setCategory(request.getCategory());
        ea.setDescription(request.getDescription());
        ea.setYearsOfExperience(request.getYearsOfExperience());
        ea.setIsMentoringArea(request.getIsMentoringArea());
        return ea;
    }

    private AlumniProfileResponse.ExpertiseAreaResponse mapToResponse(ExpertiseArea ea) {
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