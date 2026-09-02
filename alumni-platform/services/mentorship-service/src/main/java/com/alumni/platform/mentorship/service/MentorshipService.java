package com.alumni.platform.mentorship.service;

import com.alumni.platform.mentorship.dto.request.MentorshipUpdateRequest;
import com.alumni.platform.mentorship.dto.response.MentorshipResponse;
import com.alumni.platform.mentorship.entity.Mentorship;
import com.alumni.platform.mentorship.entity.MentorshipCategory;
import com.alumni.platform.mentorship.exception.MentorshipNotFoundException;
import com.alumni.platform.mentorship.exception.CategoryNotFoundException;
import com.alumni.platform.mentorship.exception.UnauthorizedException;
import com.alumni.platform.mentorship.repository.MentorshipCategoryRepository;
import com.alumni.platform.mentorship.repository.MentorshipRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class MentorshipService {

    private final MentorshipRepository mentorshipRepository;
    private final MentorshipCategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public Page<MentorshipResponse> getMentorshipsForStudent(UUID studentId, Pageable pageable) {
        return mentorshipRepository.findByStudentIdOrderByStartedAtDesc(studentId, pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public Page<MentorshipResponse> getMentorshipsForAlumni(UUID alumniId, Pageable pageable) {
        return mentorshipRepository.findByAlumniIdOrderByStartedAtDesc(alumniId, pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public MentorshipResponse getMentorship(UUID mentorshipId, UUID userId) {
        Mentorship mentorship = mentorshipRepository.findById(mentorshipId)
                .orElseThrow(() -> new MentorshipNotFoundException("Mentorship not found: " + mentorshipId));

        if (!mentorship.getStudentId().equals(userId) && !mentorship.getAlumniId().equals(userId)) {
            throw new UnauthorizedException("Not authorized to view this mentorship");
        }

        return mapToResponse(mentorship);
    }

    @Transactional
    public MentorshipResponse updateMentorship(UUID userId, UUID mentorshipId, MentorshipUpdateRequest request) {
        log.info("User {} updating mentorship {}", userId, mentorshipId);

        Mentorship mentorship = mentorshipRepository.findById(mentorshipId)
                .orElseThrow(() -> new MentorshipNotFoundException("Mentorship not found: " + mentorshipId));

        // Both student and alumni can update (e.g., goals)
        if (!mentorship.getStudentId().equals(userId) && !mentorship.getAlumniId().equals(userId)) {
            throw new UnauthorizedException("Not authorized to update this mentorship");
        }

        if (request.getGoals() != null) {
            mentorship.setGoals(request.getGoals());
        }
        if (request.getCategoryId() != null) {
            MentorshipCategory category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new CategoryNotFoundException("Category not found: " + request.getCategoryId()));
            if (!category.getIsActive()) {
                throw new IllegalStateException("Category is not active");
            }
            mentorship.setCategoryId(category.getId());
        }

        mentorship = mentorshipRepository.save(mentorship);
        log.info("Updated mentorship: {}", mentorshipId);
        return mapToResponse(mentorship);
    }

    @Transactional
    public void endMentorship(UUID userId, UUID mentorshipId, String reason) {
        log.info("User {} ending mentorship {}", userId, mentorshipId);

        Mentorship mentorship = mentorshipRepository.findById(mentorshipId)
                .orElseThrow(() -> new MentorshipNotFoundException("Mentorship not found: " + mentorshipId));

        if (!mentorship.getStudentId().equals(userId) && !mentorship.getAlumniId().equals(userId)) {
            throw new UnauthorizedException("Not authorized to end this mentorship");
        }

        if (mentorship.getStatus() == Mentorship.MentorshipStatus.COMPLETED ||
            mentorship.getStatus() == Mentorship.MentorshipStatus.TERMINATED) {
            throw new IllegalStateException("Mentorship already ended");
        }

        mentorship.setStatus(Mentorship.MentorshipStatus.COMPLETED);
        mentorship.setEndedAt(Instant.now());
        mentorship.setEndedReason(reason);
        mentorshipRepository.save(mentorship);

        log.info("Ended mentorship: {}", mentorshipId);
    }

    @Transactional
    public void pauseMentorship(UUID userId, UUID mentorshipId) {
        log.info("User {} pausing mentorship {}", userId, mentorshipId);

        Mentorship mentorship = mentorshipRepository.findById(mentorshipId)
                .orElseThrow(() -> new MentorshipNotFoundException("Mentorship not found: " + mentorshipId));

        if (!mentorship.getAlumniId().equals(userId)) {
            throw new UnauthorizedException("Only alumni can pause mentorship");
        }

        if (mentorship.getStatus() != Mentorship.MentorshipStatus.ACTIVE) {
            throw new IllegalStateException("Only active mentorships can be paused");
        }

        mentorship.setStatus(Mentorship.MentorshipStatus.PAUSED);
        mentorshipRepository.save(mentorship);
    }

    @Transactional
    public void resumeMentorship(UUID userId, UUID mentorshipId) {
        log.info("User {} resuming mentorship {}", userId, mentorshipId);

        Mentorship mentorship = mentorshipRepository.findById(mentorshipId)
                .orElseThrow(() -> new MentorshipNotFoundException("Mentorship not found: " + mentorshipId));

        if (!mentorship.getAlumniId().equals(userId)) {
            throw new UnauthorizedException("Only alumni can resume mentorship");
        }

        if (mentorship.getStatus() != Mentorship.MentorshipStatus.PAUSED) {
            throw new IllegalStateException("Only paused mentorships can be resumed");
        }

        mentorship.setStatus(Mentorship.MentorshipStatus.ACTIVE);
        mentorshipRepository.save(mentorship);
    }

    private MentorshipResponse mapToResponse(Mentorship m) {
        String categoryName = categoryRepository.findById(m.getCategoryId())
                .map(MentorshipCategory::getName)
                .orElse("Unknown");

        return MentorshipResponse.builder()
                .id(m.getId())
                .studentId(m.getStudentId())
                .alumniId(m.getAlumniId())
                .categoryId(m.getCategoryId())
                .categoryName(categoryName)
                .status(m.getStatus())
                .goals(m.getGoals())
                .startedAt(m.getStartedAt())
                .endedAt(m.getEndedAt())
                .endedReason(m.getEndedReason())
                .createdAt(m.getCreatedAt())
                .updatedAt(m.getUpdatedAt())
                .build();
    }
}