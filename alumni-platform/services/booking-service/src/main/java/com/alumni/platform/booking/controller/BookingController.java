package com.alumni.platform.booking.controller;

import com.alumni.platform.booking.dto.request.BookingRequest;
import com.alumni.platform.booking.dto.response.BookingResponse;
import com.alumni.platform.booking.service.BookingService;
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
@RequestMapping("/api/booking")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(
            @RequestHeader("X-User-Id") UUID studentId,
            @Valid @RequestBody BookingRequest request) {
        return ResponseEntity.ok(bookingService.createBooking(studentId, request));
    }

    @GetMapping("/student")
    public ResponseEntity<Page<BookingResponse>> getStudentBookings(
            @RequestHeader("X-User-Id") UUID studentId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {
        Sort.Direction dir = sort.endsWith(",desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        String prop = sort.replace(",desc", "").replace(",asc", "");
        Pageable pageable = PageRequest.of(page, size, Sort.by(dir, prop));
        return ResponseEntity.ok(bookingService.getStudentBookings(studentId, pageable));
    }

    @GetMapping("/alumni")
    public ResponseEntity<Page<BookingResponse>> getAlumniBookings(
            @RequestHeader("X-User-Id") UUID alumniId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {
        Sort.Direction dir = sort.endsWith(",desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        String prop = sort.replace(",desc", "").replace(",asc", "");
        Pageable pageable = PageRequest.of(page, size, Sort.by(dir, prop));
        return ResponseEntity.ok(bookingService.getAlumniBookings(alumniId, pageable));
    }

    @GetMapping("/{bookingId}")
    public ResponseEntity<BookingResponse> getBooking(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable UUID bookingId) {
        return ResponseEntity.ok(bookingService.getBooking(userId, bookingId));
    }

    @PutMapping("/{bookingId}/confirm")
    public ResponseEntity<BookingResponse> confirmBooking(
            @RequestHeader("X-User-Id") UUID alumniId,
            @PathVariable UUID bookingId) {
        return ResponseEntity.ok(bookingService.confirmBooking(alumniId, bookingId));
    }

    @DeleteMapping("/{bookingId}")
    public ResponseEntity<BookingResponse> cancelBooking(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable UUID bookingId,
            @RequestParam(required = false) String reason) {
        return ResponseEntity.ok(bookingService.cancelBooking(userId, bookingId, reason));
    }
}