package com.alumni.platform.notification.controller;

import com.alumni.platform.notification.dto.EmailTemplateRequest;
import com.alumni.platform.notification.dto.EmailTemplateResponse;
import com.alumni.platform.notification.service.EmailTemplateService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/email-templates")
public class EmailTemplateController {

    private final EmailTemplateService templateService;

    public EmailTemplateController(EmailTemplateService templateService) {
        this.templateService = templateService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EmailTemplateResponse> create(@Valid @RequestBody EmailTemplateRequest request) {
        return ResponseEntity.ok(templateService.create(request));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<EmailTemplateResponse>> list() {
        return ResponseEntity.ok(templateService.list());
    }

    @GetMapping("/{name}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EmailTemplateResponse> get(@PathVariable String name) {
        return ResponseEntity.ok(templateService.get(name));
    }

    @PutMapping("/{name}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EmailTemplateResponse> update(@PathVariable String name,
                                                        @Valid @RequestBody EmailTemplateRequest request) {
        return ResponseEntity.ok(templateService.update(name, request));
    }

    @DeleteMapping("/{name}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable String name) {
        templateService.delete(name);
        return ResponseEntity.noContent().build();
    }
}