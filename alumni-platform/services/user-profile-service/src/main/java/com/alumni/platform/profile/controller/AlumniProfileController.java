package com.alumni.platform.profile.controller;

import com.alumni.platform.profile.dto.request.AlumniProfileRequest;
import com.alumni.platform.profile.dto.response.AlumniProfileResponse;
import com.alumni.platform.profile.entity.AlumniProfile;
import com.alumni.platform.profile.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/alumni/profile")
@RequiredArgsConstructor
public class AlumniProfileController {

    private final ProfileService profileService;

    @PostMapping
    public ResponseEntity<AlumniProfileResponse> createProfile(
            @RequestHeader("X-User-Id") UUID userId,
            @Valid @RequestBody AlumniProfileRequest request) {
        AlumniProfileResponse response = profileService.createAlumniProfile(userId, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<AlumniProfileResponse> getProfile(
            @RequestHeader("X-User-Id") UUID userId) {
        AlumniProfileResponse response = profileService.getAlumniProfile(userId);
        return ResponseEntity.ok(response);
    }

    @PutMapping
    public ResponseEntity<AlumniProfileResponse> updateProfile(
            @RequestHeader("X-User-Id") UUID userId,
            @Valid @RequestBody AlumniProfileRequest request) {
        AlumniProfileResponse response = profileService.updateAlumniProfile(userId, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{profileId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STUDENT')")
    public ResponseEntity<AlumniProfileResponse> getProfileById(@PathVariable UUID profileId) {
        AlumniProfileResponse response = profileService.getAlumniProfileById(profileId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{profileId}/verification")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AlumniProfileResponse> verifyAlumni(
            @PathVariable UUID profileId,
            @RequestParam AlumniProfile.VerificationStatus status,
            @RequestHeader("X-User-Id") UUID adminId) {
        // TODO: Implement verification logic
        return ResponseEntity.ok().build();
    }
}