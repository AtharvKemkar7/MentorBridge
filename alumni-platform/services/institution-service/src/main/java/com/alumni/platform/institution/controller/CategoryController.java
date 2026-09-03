package com.alumni.platform.institution.controller;

import com.alumni.platform.institution.dto.CategoryRequest;
import com.alumni.platform.institution.dto.CategoryResponse;
import com.alumni.platform.institution.dto.PageResponse;
import com.alumni.platform.institution.service.CategoryService;
import jakarta.validation.Valid;
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
@RequestMapping("/api/institute/{instituteId}/categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CategoryResponse> create(
            @PathVariable UUID instituteId,
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody CategoryRequest req) {
        UUID adminUserId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.ok(categoryService.create(instituteId, adminUserId, req));
    }

    @GetMapping
    public ResponseEntity<PageResponse<CategoryResponse>> list(
            @PathVariable UUID instituteId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt,desc") String[] sort) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.fromString(sort[1].toUpperCase()), sort[0]));
        return ResponseEntity.ok(new PageResponse<>(categoryService.list(instituteId, pageable)));
    }

    @PutMapping("/{categoryId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CategoryResponse> update(
            @PathVariable UUID instituteId,
            @PathVariable UUID categoryId,
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody CategoryRequest req) {
        UUID adminUserId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.ok(categoryService.update(instituteId, adminUserId, categoryId, req));
    }

    @DeleteMapping("/{categoryId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(
            @PathVariable UUID instituteId,
            @PathVariable UUID categoryId,
            @AuthenticationPrincipal Jwt jwt) {
        UUID adminUserId = UUID.fromString(jwt.getSubject());
        categoryService.delete(instituteId, adminUserId, categoryId);
        return ResponseEntity.noContent().build();
    }
}