package com.alumni.platform.institution.controller;

import com.alumni.platform.institution.dto.InstituteRequest;
import com.alumni.platform.institution.dto.InstituteResponse;
import com.alumni.platform.institution.service.InstituteService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/institute")
public class InstituteController {

    private final InstituteService instituteService;

    public InstituteController(InstituteService instituteService) {
        this.instituteService = instituteService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<InstituteResponse> create(@Valid @RequestBody InstituteRequest req) {
        return ResponseEntity.ok(instituteService.create(req));
    }

    @GetMapping("/{id}")
    public ResponseEntity<InstituteResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(instituteService.getById(id));
    }

    @GetMapping("/domain/{domain}")
    public ResponseEntity<InstituteResponse> getByDomain(@PathVariable String domain) {
        return ResponseEntity.ok(instituteService.getByDomain(domain));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<InstituteResponse> update(@PathVariable UUID id,
                                                    @Valid @RequestBody InstituteRequest req) {
        return ResponseEntity.ok(instituteService.update(id, req));
    }
}