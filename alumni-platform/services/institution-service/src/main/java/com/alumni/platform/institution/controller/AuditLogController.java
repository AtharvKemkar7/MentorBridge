package com.alumni.platform.institution.controller;

import com.alumni.platform.institution.dto.AuditLogResponse;
import com.alumni.platform.institution.dto.PageResponse;
import com.alumni.platform.institution.service.AuditLogService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/audit-logs")
public class AuditLogController {

    private final AuditLogService auditLogService;

    public AuditLogController(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PageResponse<AuditLogResponse>> myLogs(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt,desc") String[] sort) {
        UUID adminUserId = UUID.fromString(jwt.getSubject());
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.fromString(sort[1].toUpperCase()), sort[0]));
        return ResponseEntity.ok(new PageResponse<>(auditLogService.listByAdmin(adminUserId, pageable)));
    }
}