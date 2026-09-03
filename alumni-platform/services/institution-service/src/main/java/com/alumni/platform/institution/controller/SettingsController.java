package com.alumni.platform.institution.controller;

import com.alumni.platform.institution.dto.SettingsRequest;
import com.alumni.platform.institution.dto.SettingsResponse;
import com.alumni.platform.institution.service.SettingsService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/institute/{instituteId}/settings")
public class SettingsController {

    private final SettingsService settingsService;

    public SettingsController(SettingsService settingsService) {
        this.settingsService = settingsService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SettingsResponse> create(@PathVariable UUID instituteId,
                                                   @Valid @RequestBody SettingsRequest req) {
        return ResponseEntity.ok(settingsService.create(instituteId, req));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<SettingsResponse>> list(@PathVariable UUID instituteId) {
        return ResponseEntity.ok(settingsService.list(instituteId));
    }

    @GetMapping("/{key}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SettingsResponse> get(@PathVariable UUID instituteId,
                                                @PathVariable String key) {
        return ResponseEntity.ok(settingsService.get(instituteId, key));
    }

    @PutMapping("/{key}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SettingsResponse> update(@PathVariable UUID instituteId,
                                                   @PathVariable String key,
                                                   @Valid @RequestBody SettingsRequest req) {
        return ResponseEntity.ok(settingsService.update(instituteId, key, req));
    }

    @DeleteMapping("/{key}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable UUID instituteId,
                                       @PathVariable String key) {
        settingsService.delete(instituteId, key);
        return ResponseEntity.noContent().build();
    }
}