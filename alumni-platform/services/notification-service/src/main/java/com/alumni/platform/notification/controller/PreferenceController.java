package com.alumni.platform.notification.controller;

import com.alumni.platform.notification.dto.PreferenceRequest;
import com.alumni.platform.notification.dto.PreferenceResponse;
import com.alumni.platform.notification.service.NotificationPreferenceService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/notification-preferences")
public class PreferenceController {

    private final NotificationPreferenceService preferenceService;

    public PreferenceController(NotificationPreferenceService preferenceService) {
        this.preferenceService = preferenceService;
    }

    @GetMapping
    public ResponseEntity<PreferenceResponse> getMyPreferences(@AuthenticationPrincipal Jwt jwt) {
        UUID userId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.ok(preferenceService.getPreferences(userId));
    }

    @PutMapping
    public ResponseEntity<PreferenceResponse> updateMyPreferences(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody PreferenceRequest request) {
        UUID userId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.ok(preferenceService.updatePreferences(userId, request));
    }
}