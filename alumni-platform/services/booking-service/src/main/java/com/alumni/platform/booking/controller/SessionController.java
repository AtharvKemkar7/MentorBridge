package com.alumni.platform.booking.controller;

import com.alumni.platform.booking.dto.request.SessionRequest;
import com.alumni.platform.booking.dto.response.SessionResponse;
import com.alumni.platform.booking.service.SessionService;
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
@RequestMapping("/api/booking/sessions")
@RequiredArgsConstructor
public class SessionController {

    private final SessionService sessionService;

    @PostMapping
    public ResponseEntity<SessionResponse> createSession(
            @RequestHeader("X-User-Id") UUID alumniId,
            @RequestParam UUID bookingId,
            @Valid @RequestBody SessionRequest request) {
        return ResponseEntity.ok(sessionService.createSession(bookingId, alumniId, request));
    }

    @GetMapping("/student")
    public ResponseEntity<Page<SessionResponse>> getStudentSessions(
            @RequestHeader("X-User-Id") UUID studentId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "startTime,desc") String sort) {
        Sort.Direction dir = sort.endsWith(",desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        String prop = sort.replace(",desc", "").replace(",asc", "");
        Pageable pageable = PageRequest.of(page, size, Sort.by(dir, prop));
        return ResponseEntity.ok(sessionService.getStudentSessions(studentId, pageable));
    }

    @GetMapping("/alumni")
    public ResponseEntity<Page<SessionResponse>> getAlumniSessions(
            @RequestHeader("X-User-Id") UUID alumniId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "startTime,desc") String sort) {
        Sort.Direction dir = sort.endsWith(",desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        String prop = sort.replace(",desc", "").replace(",asc", "");
        Pageable pageable = PageRequest.of(page, size, Sort.by(dir, prop));
        return ResponseEntity.ok(sessionService.getAlumniSessions(alumniId, pageable));
    }

    @GetMapping("/{sessionId}")
    public ResponseEntity<SessionResponse> getSession(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable UUID sessionId) {
        return ResponseEntity.ok(sessionService.getSession(userId, sessionId));
    }

    @PutMapping("/{sessionId}/start")
    public ResponseEntity<SessionResponse> startSession(
            @RequestHeader("X-User-Id") UUID alumniId,
            @PathVariable UUID sessionId) {
        return ResponseEntity.ok(sessionService.startSession(alumniId, sessionId));
    }

    @PutMapping("/{sessionId}/complete")
    public ResponseEntity<SessionResponse> completeSession(
            @RequestHeader("X-User-Id") UUID alumniId,
            @PathVariable UUID sessionId,
            @RequestParam(required = false) String notes) {
        return ResponseEntity.ok(sessionService.completeSession(alumniId, sessionId, notes));
    }

    @PutMapping("/{sessionId}/cancel")
    public ResponseEntity<SessionResponse> cancelSession(
            @RequestHeader("X-User-Id") UUID alumniId,
            @PathVariable UUID sessionId) {
        return ResponseEntity.ok(sessionService.cancelSession(alumniId, sessionId));
    }

    @PutMapping("/{sessionId}/no-show")
    public ResponseEntity<SessionResponse> markNoShow(
            @RequestHeader("X-User-Id") UUID alumniId,
            @PathVariable UUID sessionId) {
        return ResponseEntity.ok(sessionService.markNoShow(alumniId, sessionId));
    }
}