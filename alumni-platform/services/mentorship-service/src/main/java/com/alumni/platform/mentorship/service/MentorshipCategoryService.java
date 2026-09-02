package com.alumni.platform.mentorship.service;

import com.alumni.platform.mentorship.dto.request.MentorshipCategoryRequest;
import com.alumni.platform.mentorship.dto.response.MentorshipCategoryResponse;
import com.alumni.platform.mentorship.entity.MentorshipCategory;
import com.alumni.platform.mentorship.exception.CategoryNotFoundException;
import com.alumni.platform.mentorship.exception.CategoryAlreadyExistsException;
import com.alumni.platform.mentorship.repository.MentorshipCategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class MentorshipCategoryService {

    private final MentorshipCategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public Page<MentorshipCategoryResponse> getAllCategories(Pageable pageable) {
        return categoryRepository.findByIsActiveTrue(pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public MentorshipCategoryResponse getCategory(UUID id) {
        MentorshipCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new CategoryNotFoundException("Category not found: " + id));
        return mapToResponse(category);
    }

    @Transactional(readOnly = true)
    public MentorshipCategoryResponse getCategoryByName(String name) {
        MentorshipCategory category = categoryRepository.findByName(name)
                .orElseThrow(() -> new CategoryNotFoundException("Category not found: " + name));
        return mapToResponse(category);
    }

    @Transactional
    public MentorshipCategoryResponse createCategory(MentorshipCategoryRequest request) {
        log.info("Creating mentorship category: {}", request.getName());

        if (categoryRepository.findByName(request.getName()).isPresent()) {
            throw new CategoryAlreadyExistsException("Category already exists: " + request.getName());
        }

        MentorshipCategory category = MentorshipCategory.builder()
                .name(request.getName())
                .description(request.getDescription())
                .icon(request.getIcon())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0)
                .build();

        category = categoryRepository.save(category);
        log.info("Created category: {}", category.getId());
        return mapToResponse(category);
    }

    @Transactional
    public MentorshipCategoryResponse updateCategory(UUID id, MentorshipCategoryRequest request) {
        log.info("Updating category: {}", id);

        MentorshipCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new CategoryNotFoundException("Category not found: " + id));

        if (request.getName() != null && !request.getName().equals(category.getName())) {
            if (categoryRepository.findByName(request.getName()).isPresent()) {
                throw new CategoryAlreadyExistsException("Category name already exists: " + request.getName());
            }
            category.setName(request.getName());
        }

        if (request.getDescription() != null) category.setDescription(request.getDescription());
        if (request.getIcon() != null) category.setIcon(request.getIcon());
        if (request.getIsActive() != null) category.setIsActive(request.getIsActive());
        if (request.getSortOrder() != null) category.setSortOrder(request.getSortOrder());

        category = categoryRepository.save(category);
        log.info("Updated category: {}", category.getId());
        return mapToResponse(category);
    }

    @Transactional
    public void deleteCategory(UUID id) {
        log.info("Deleting category: {}", id);
        MentorshipCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new CategoryNotFoundException("Category not found: " + id));
        categoryRepository.delete(category);
    }

    private MentorshipCategoryResponse mapToResponse(MentorshipCategory c) {
        return MentorshipCategoryResponse.builder()
                .id(c.getId())
                .name(c.getName())
                .description(c.getDescription())
                .icon(c.getIcon())
                .isActive(c.getIsActive())
                .sortOrder(c.getSortOrder())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }
}