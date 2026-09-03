package com.alumni.platform.institution.service;

import com.alumni.platform.institution.dto.CategoryRequest;
import com.alumni.platform.institution.dto.CategoryResponse;
import com.alumni.platform.institution.entity.MentorshipCategory;
import com.alumni.platform.institution.repository.MentorshipCategoryRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional
public class CategoryService {

    private final MentorshipCategoryRepository categoryRepository;
    private final AuditLogService auditLogService;

    public CategoryService(MentorshipCategoryRepository categoryRepository,
                           AuditLogService auditLogService) {
        this.categoryRepository = categoryRepository;
        this.auditLogService = auditLogService;
    }

    public CategoryResponse create(UUID instituteId, UUID adminUserId, CategoryRequest req) {
        MentorshipCategory c = new MentorshipCategory();
        c.setId(UUID.randomUUID());
        c.setInstituteId(instituteId);
        c.setName(req.getName());
        c.setDescription(req.getDescription());
        c.setIsActive(req.getIsActive());
        c = categoryRepository.save(c);

        auditLogService.log(adminUserId, "CATEGORY_CREATED", "MENTORSHIP_CATEGORY", c.getId(),
                "{\"name\":\"" + c.getName() + "\"}");
        return toResponse(c);
    }

    @Transactional(readOnly = true)
    public Page<CategoryResponse> list(UUID instituteId, Pageable pageable) {
        return categoryRepository.findByInstituteId(instituteId, pageable).map(this::toResponse);
    }

    public CategoryResponse update(UUID instituteId, UUID adminUserId, UUID categoryId, CategoryRequest req) {
        MentorshipCategory c = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));
        if (!c.getInstituteId().equals(instituteId)) {
            throw new IllegalArgumentException("Category not in institute");
        }
        c.setName(req.getName());
        c.setDescription(req.getDescription());
        c.setIsActive(req.getIsActive());
        c = categoryRepository.save(c);

        auditLogService.log(adminUserId, "CATEGORY_UPDATED", "MENTORSHIP_CATEGORY", c.getId(),
                "{\"name\":\"" + c.getName() + "\"}");
        return toResponse(c);
    }

    public void delete(UUID instituteId, UUID adminUserId, UUID categoryId) {
        MentorshipCategory c = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));
        if (!c.getInstituteId().equals(instituteId)) {
            throw new IllegalArgumentException("Category not in institute");
        }
        categoryRepository.delete(c);
        auditLogService.log(adminUserId, "CATEGORY_DELETED", "MENTORSHIP_CATEGORY", categoryId, null);
    }

    private CategoryResponse toResponse(MentorshipCategory c) {
        return new CategoryResponse(c.getId(), c.getInstituteId(), c.getName(),
                c.getDescription(), c.getIsActive(), c.getCreatedAt(), c.getUpdatedAt());
    }
}