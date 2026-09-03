package com.alumni.platform.institution.controller;

import com.alumni.platform.institution.dto.VerificationDecisionRequest;
import com.alumni.platform.institution.dto.VerificationResponse;
import com.alumni.platform.institution.dto.PageResponse;
import com.alumni.platform.institution.service.VerificationService;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/institute/{instituteId}/verifications")
public class VerificationController {

    private final VerificationService verificationService;

    public VerificationController(VerificationService verificationService) {
        this.verificationService = verificationService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PageResponse<VerificationResponse>> list(
            @PathVariable UUID instituteId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt,desc") String[] sort) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.fromString(sort[1].toUpperCase()), sort[0]));
        return ResponseEntity.ok(new PageResponse<>(verificationService.list(instituteId, pageable)));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PageResponse<VerificationResponse>> pending(
            @PathVariable UUID instituteId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").ascending());
        return ResponseEntity.ok(new PageResponse<>(verificationService.listPending(instituteId, pageable)));
    }

    @PutMapping("/{verificationId}/decision")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<VerificationResponse> decide(
            @PathVariable UUID instituteId,
            @PathVariable UUID verificationId,
            @Valid @RequestBody VerificationDecisionRequest req) {
        // adminUserId extracted from JWT in a real impl; here placeholder
        UUID adminUserId = UUID.randomUUID(); // TODO replace with actual JWT subject
        return ResponseEntity.ok(verificationService.decide(verificationId, adminUserId, req));
    }
}