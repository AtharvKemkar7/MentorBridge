package com.alumni.platform.mentorship.controller;

import com.alumni.platform.mentorship.dto.request.MentorshipRequestRequest;
import com.alumni.platform.mentorship.dto.response.MentorshipRequestResponse;
import com.alumni.platform.mentorship.service.MentorshipRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/mentorship/requests")
@RequiredArgsConstructor
public class MentorshipRequestController {

    private final MentorshipRequestService requestService;

    @PostMapping
    public ResponseEntity<MentorshipRequestResponse> createRequest(
            @RequestHeader("X-User-Id") UUID studentId,
            @Valid @RequestBody MentorshipRequestRequest request) {
        request.setStudentId(studentId);
        return ResponseEntity.ok(requestService.createRequest(studentId, request));
    }

    @GetMapping("/received")
    public ResponseEntity<Page<MentorshipRequestResponse>> getReceivedRequests(
            @RequestHeader("X-User-Id") UUID alumniId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {

        Sort.Direction direction = sort.endsWith(",desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        String property = sort.replace(",desc", "").replace(",asc", "");
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, property));

        return ResponseEntity.ok(requestService.getRequestsForAlumni(alumniId, pageable));
    }

    @GetMapping("/sent")
    public ResponseEntity<Page<MentorshipRequestResponse>> getSentRequests(
            @RequestHeader("X-User-Id") UUID studentId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {

        Sort.Direction direction = sort.endsWith(",desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        String property = sort.replace(",desc", "").replace(",asc", "");
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, property));

        return ResponseEntity.ok(requestService.getRequestsForStudent(studentId, pageable));
    }

    @PutMapping("/{requestId}/respond")
    public ResponseEntity<MentorshipRequestResponse> respondToRequest(
            @RequestHeader("X-User-Id") UUID alumniId,
            @PathVariable UUID requestId,
            @RequestParam boolean accept,
            @RequestParam(required = false) String responseMessage) {
        return ResponseEntity.ok(requestService.respondToRequest(alumniId, requestId, accept, responseMessage));
    }

    @DeleteMapping("/{requestId}")
    public ResponseEntity<Void> cancelRequest(
            @RequestHeader("X-User-Id") UUID studentId,
            @PathVariable UUID requestId) {
        requestService.cancelRequest(studentId, requestId);
        return ResponseEntity.ok().build();
    }
}