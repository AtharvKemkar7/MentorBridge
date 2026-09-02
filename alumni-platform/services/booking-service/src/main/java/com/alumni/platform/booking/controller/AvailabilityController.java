package com.alumni.platform.booking.controller;

import com.alumni.platform.booking.dto.request.AvailabilityRequest;
import com.alumni.platform.booking.dto.response.AvailabilityResponse;
import com.alumni.platform.booking.service.AvailabilityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/booking/availability")
@RequiredArgsConstructor
public class AvailabilityController {

    private final AvailabilityService availabilityService;

    @PostMapping
    public ResponseEntity<AvailabilityResponse> createAvailability(
            @RequestHeader("X-User-Id") UUID alumniId,
            @Valid @RequestBody AvailabilityRequest request) {
        return ResponseEntity.ok(availabilityService.createAvailability(alumniId, request));
    }

    @GetMapping
    public ResponseEntity<Page<AvailabilityResponse>> getAvailabilities(
            @RequestHeader("X-User-Id") UUID alumniId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "date,desc") String sort) {
        Sort.Direction dir = sort.endsWith(",desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        String prop = sort.replace(",desc", "").replace(",asc", "");
        Pageable pageable = PageRequest.of(page, size, Sort.by(dir, prop));
        return ResponseEntity.ok(availabilityService.getAvailabilities(alumniId, pageable));
    }

    @GetMapping("/range")
    public ResponseEntity<List<AvailabilityResponse>> getAvailabilitiesByRange(
            @RequestHeader("X-User-Id") UUID alumniId,
            @RequestParam LocalDate start,
            @RequestParam LocalDate end) {
        return ResponseEntity.ok(availabilityService.getAvailabilitiesByDateRange(alumniId, start, end));
    }

    @GetMapping("/{availabilityId}")
    public ResponseEntity<AvailabilityResponse> getAvailability(
            @RequestHeader("X-User-Id") UUID alumniId,
            @PathVariable UUID availabilityId) {
        return ResponseEntity.ok(availabilityService.getAvailability(alumniId, availabilityId));
    }

    @PutMapping("/{availabilityId}")
    public ResponseEntity<AvailabilityResponse> updateAvailability(
            @RequestHeader("X-User-Id") UUID alumniId,
            @PathVariable UUID availabilityId,
            @Valid @RequestBody AvailabilityRequest request) {
        return ResponseEntity.ok(availabilityService.updateAvailability(alumniId, availabilityId, request));
    }

    @DeleteMapping("/{availabilityId}")
    public ResponseEntity<Void> deleteAvailability(
            @RequestHeader("X-User-Id") UUID alumniId,
            @PathVariable UUID availabilityId) {
        availabilityService.deleteAvailability(alumniId, availabilityId);
        return ResponseEntity.ok().build();
    }
}