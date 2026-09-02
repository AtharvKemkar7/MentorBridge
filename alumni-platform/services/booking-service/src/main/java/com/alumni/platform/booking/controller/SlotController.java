package com.alumni.platform.booking.controller;

import com.alumni.platform.booking.dto.request.SlotRequest;
import com.alumni.platform.booking.dto.response.SlotResponse;
import com.alumni.platform.booking.service.SlotService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/booking/slots")
@RequiredArgsConstructor
public class SlotController {

    private final SlotService slotService;

    @PostMapping("/generate")
    public ResponseEntity<List<SlotResponse>> generateSlots(
            @RequestHeader("X-User-Id") UUID alumniId,
            @RequestParam UUID availabilityId) {
        return ResponseEntity.ok(slotService.generateSlots(alumniId, availabilityId));
    }

    @PostMapping
    public ResponseEntity<SlotResponse> createSlot(
            @RequestHeader("X-User-Id") UUID alumniId,
            @Valid @RequestBody SlotRequest request) {
        return ResponseEntity.ok(slotService.createSlot(alumniId, request));
    }

    @GetMapping
    public ResponseEntity<Page<SlotResponse>> getSlots(
            @RequestHeader("X-User-Id") UUID alumniId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "startTime,asc") String sort) {
        Sort.Direction dir = sort.endsWith(",desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        String prop = sort.replace(",desc", "").replace(",asc", "");
        Pageable pageable = PageRequest.of(page, size, Sort.by(dir, prop));
        return ResponseEntity.ok(slotService.getSlots(alumniId, pageable));
    }

    @GetMapping("/available")
    public ResponseEntity<List<SlotResponse>> getAvailableSlots(
            @RequestHeader("X-User-Id") UUID alumniId,
            @RequestParam ZonedDateTime start,
            @RequestParam ZonedDateTime end) {
        return ResponseEntity.ok(slotService.getAvailableSlots(alumniId, start, end));
    }

    @GetMapping("/{slotId}")
    public ResponseEntity<SlotResponse> getSlot(
            @RequestHeader("X-User-Id") UUID alumniId,
            @PathVariable UUID slotId) {
        return ResponseEntity.ok(slotService.getSlot(alumniId, slotId));
    }

    @PutMapping("/{slotId}/block")
    public ResponseEntity<Void> blockSlot(
            @RequestHeader("X-User-Id") UUID alumniId,
            @PathVariable UUID slotId) {
        slotService.blockSlot(alumniId, slotId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{slotId}/unblock")
    public ResponseEntity<Void> unblockSlot(
            @RequestHeader("X-User-Id") UUID alumniId,
            @PathVariable UUID slotId) {
        slotService.unblockSlot(alumniId, slotId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{slotId}")
    public ResponseEntity<Void> deleteSlot(
            @RequestHeader("X-User-Id") UUID alumniId,
            @PathVariable UUID slotId) {
        slotService.deleteSlot(alumniId, slotId);
        return ResponseEntity.ok().build();
    }
}