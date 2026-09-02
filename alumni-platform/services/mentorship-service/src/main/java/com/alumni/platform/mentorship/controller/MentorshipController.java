package com.alumni.platform.mentorship.controller;

import com.alumni.platform.mentorship.dto.request.MentorshipUpdateRequest;
import com.alumni.platform.mentorship.dto.response.MentorshipResponse;
import com.alumni.platform.mentorship.service.MentorshipService;
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
@RequestMapping("/api/mentorship")
@RequiredArgsConstructor
public class MentorshipController {

    private final MentorshipService mentorshipService;

    @GetMapping("/student")
    public ResponseEntity<Page<MentorshipResponse>> getStudentMentorships(
            @RequestHeader("X-User-Id") UUID studentId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "startedAt,desc") String sort) {

        Sort.Direction direction = sort.endsWith(",desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        String property = sort.replace(",desc", "").replace(",asc", "");
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, property));

        return ResponseEntity.ok(mentorshipService.getMentorshipsForStudent(studentId, pageable));
    }

    @GetMapping("/alumni")
    public ResponseEntity<Page<MentorshipResponse>> getAlumniMentorships(
            @RequestHeader("X-User-Id") UUID alumniId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "startedAt,desc") String sort) {

        Sort.Direction direction = sort.endsWith(",desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        String property = sort.replace(",desc", "").replace(",asc", "");
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, property));

        return ResponseEntity.ok(mentorshipService.getMentorshipsForAlumni(alumniId, pageable));
    }

    @GetMapping("/{mentorshipId}")
    public ResponseEntity<MentorshipResponse> getMentorship(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable UUID mentorshipId) {
        return ResponseEntity.ok(mentorshipService.getMentorship(mentorshipId, userId));
    }

    @PutMapping("/{mentorshipId}")
    public ResponseEntity<MentorshipResponse> updateMentorship(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable UUID mentorshipId,
            @Valid @RequestBody MentorshipUpdateRequest request) {
        return ResponseEntity.ok(mentorshipService.updateMentorship(userId, mentorshipId, request));
    }

    @DeleteMapping("/{mentorshipId}")
    public ResponseEntity<Void> endMentorship(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable UUID mentorshipId,
            @RequestParam(required = false) String reason) {
        mentorshipService.endMentorship(userId, mentorshipId, reason);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{mentorshipId}/pause")
    public ResponseEntity<Void> pauseMentorship(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable UUID mentorshipId) {
        mentorshipService.pauseMentorship(userId, mentorshipId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{mentorshipId}/resume")
    public ResponseEntity<Void> resumeMentorship(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable UUID mentorshipId) {
        mentorshipService.resumeMentorship(userId, mentorshipId);
        return ResponseEntity.ok().build();
    }
}