package com.alumni.platform.profile.controller;

import com.alumni.platform.profile.dto.request.StudentProfileRequest;
import com.alumni.platform.profile.dto.response.StudentProfileResponse;
import com.alumni.platform.profile.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/student/profile")
@RequiredArgsConstructor
public class StudentProfileController {

    private final ProfileService profileService;

    @PostMapping
    public ResponseEntity<StudentProfileResponse> createProfile(
            @RequestHeader("X-User-Id") UUID userId,
            @Valid @RequestBody StudentProfileRequest request) {
        StudentProfileResponse response = profileService.createStudentProfile(userId, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<StudentProfileResponse> getProfile(
            @RequestHeader("X-User-Id") UUID userId) {
        StudentProfileResponse response = profileService.getStudentProfile(userId);
        return ResponseEntity.ok(response);
    }

    @PutMapping
    public ResponseEntity<StudentProfileResponse> updateProfile(
            @RequestHeader("X-User-Id") UUID userId,
            @Valid @RequestBody StudentProfileRequest request) {
        StudentProfileResponse response = profileService.updateStudentProfile(userId, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{profileId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ALUMNI')")
    public ResponseEntity<StudentProfileResponse> getProfileById(@PathVariable UUID profileId) {
        StudentProfileResponse response = profileService.getStudentProfileById(profileId);
        return ResponseEntity.ok(response);
    }
}