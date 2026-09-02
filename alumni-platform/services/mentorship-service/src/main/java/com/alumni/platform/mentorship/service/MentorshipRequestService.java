package com.alumni.platform.mentorship.service;

import com.alumni.platform.mentorship.dto.request.MentorshipRequestRequest;
import com.alumni.platform.mentorship.dto.response.MentorshipRequestResponse;
import com.alumni.platform.mentorship.entity.MentorshipCategory;
import com.alumni.platform.mentorship.entity.MentorshipRequest;
import com.alumni.platform.mentorship.entity.Mentorship;
import com.alumni.platform.mentorship.exception.*;
import com.alumni.platform.mentorship.repository.MentorshipCategoryRepository;
import com.alumni.platform.mentorship.repository.MentorshipRequestRepository;
import com.alumni.platform.mentorship.repository.MentorshipRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class MentorshipRequestService {

    private final MentorshipRequestRepository requestRepository;
    private final MentorshipCategoryRepository categoryRepository;
    private final MentorshipRepository mentorshipRepository;

    @Transactional
    public MentorshipRequestResponse createRequest(UUID studentId, MentorshipRequestRequest request) {
        log.info("Student {} creating mentorship request to alumni {}", studentId, request.getAlumniId());

        if (request.getStudentId() != null && !request.getStudentId().equals(studentId)) {
            throw new UnauthorizedException("Student ID mismatch");
        }

        // Validate category
        MentorshipCategory category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new CategoryNotFoundException("Category not found: " + request.getCategoryId()));
        if (!category.getIsActive()) {
            throw new IllegalStateException("Category is not active");
        }

        // Check if active request already exists
        List<MentorshipRequest.RequestStatus> activeStatuses = List.of(
                MentorshipRequest.RequestStatus.PENDING,
                MentorshipRequest.RequestStatus.ACCEPTED
        );
        Optional<MentorshipRequest> existing = requestRepository.findByStudentIdAndAlumniIdAndStatusIn(
                studentId, request.getAlumniId(), activeStatuses);
        if (existing.isPresent()) {
            throw new RequestAlreadyExistsException("Active request already exists for this alumni");
        }

        // Check if active mentorship already exists
        List<Mentorship.MentorshipStatus> mentorshipActiveStatuses = List.of(
                Mentorship.MentorshipStatus.ACTIVE,
                Mentorship.MentorshipStatus.PAUSED
        );
        Optional<Mentorship> existingMentorship = mentorshipRepository.findByStudentIdAndAlumniIdAndStatusIn(
                studentId, request.getAlumniId(), mentorshipActiveStatuses);
        if (existingMentorship.isPresent()) {
            throw new MentorshipAlreadyExistsException("Active mentorship already exists with this alumni");
        }

        MentorshipRequest mentorshipRequest = MentorshipRequest.builder()
                .studentId(studentId)
                .alumniId(request.getAlumniId())
                .categoryId(request.getCategoryId())
                .message(request.getMessage())
                .status(MentorshipRequest.RequestStatus.PENDING)
                .build();

        mentorshipRequest = requestRepository.save(mentorshipRequest);
        log.info("Created mentorship request: {}", mentorshipRequest.getId());
        return mapToResponse(mentorshipRequest, category.getName());
    }

    @Transactional(readOnly = true)
    public Page<MentorshipRequestResponse> getRequestsForAlumni(UUID alumniId, Pageable pageable) {
        return requestRepository.findByAlumniIdOrderByCreatedAtDesc(alumniId, pageable)
                .map(r -> mapToResponse(r, getCategoryName(r.getCategoryId())));
    }

    @Transactional(readOnly = true)
    public Page<MentorshipRequestResponse> getRequestsForStudent(UUID studentId, Pageable pageable) {
        return requestRepository.findByStudentIdOrderByCreatedAtDesc(studentId, pageable)
                .map(r -> mapToResponse(r, getCategoryName(r.getCategoryId())));
    }

    @Transactional
    public MentorshipRequestResponse respondToRequest(UUID alumniId, UUID requestId, boolean accept, String responseMessage) {
        log.info("Alumni {} responding to request {}: {}", alumniId, requestId, accept ? "ACCEPT" : "REJECT");

        MentorshipRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RequestNotFoundException("Request not found: " + requestId));

        if (!request.getAlumniId().equals(alumniId)) {
            throw new UnauthorizedException("Not authorized to respond to this request");
        }

        if (request.getStatus() != MentorshipRequest.RequestStatus.PENDING) {
            throw new IllegalStateException("Request already responded to");
        }

        if (accept) {
            request.setStatus(MentorshipRequest.RequestStatus.ACCEPTED);
            // Create mentorship relationship
            Mentorship mentorship = Mentorship.builder()
                    .studentId(request.getStudentId())
                    .alumniId(request.getAlumniId())
                    .categoryId(request.getCategoryId())
                    .status(Mentorship.MentorshipStatus.ACTIVE)
                    .goals(request.getMessage())
                    .startedAt(Instant.now())
                    .build();
            mentorshipRepository.save(mentorship);
        } else {
            request.setStatus(MentorshipRequest.RequestStatus.REJECTED);
        }

        request.setResponseMessage(responseMessage);
        request.setRespondedAt(Instant.now());
        request = requestRepository.save(request);

        log.info("Request {} responded: {}", requestId, request.getStatus());
        return mapToResponse(request, getCategoryName(request.getCategoryId()));
    }

    @Transactional
    public void cancelRequest(UUID studentId, UUID requestId) {
        log.info("Student {} cancelling request {}", studentId, requestId);

        MentorshipRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RequestNotFoundException("Request not found: " + requestId));

        if (!request.getStudentId().equals(studentId)) {
            throw new UnauthorizedException("Not authorized to cancel this request");
        }

        if (request.getStatus() != MentorshipRequest.RequestStatus.PENDING) {
            throw new IllegalStateException("Cannot cancel non-pending request");
        }

        request.setStatus(MentorshipRequest.RequestStatus.CANCELLED);
        requestRepository.save(request);
    }

    private String getCategoryName(UUID categoryId) {
        return categoryRepository.findById(categoryId)
                .map(MentorshipCategory::getName)
                .orElse("Unknown");
    }

    private MentorshipRequestResponse mapToResponse(MentorshipRequest r, String categoryName) {
        return MentorshipRequestResponse.builder()
                .id(r.getId())
                .studentId(r.getStudentId())
                .alumniId(r.getAlumniId())
                .categoryId(r.getCategoryId())
                .categoryName(categoryName)
                .message(r.getMessage())
                .status(r.getStatus())
                .responseMessage(r.getResponseMessage())
                .respondedAt(r.getRespondedAt())
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .build();
    }
}