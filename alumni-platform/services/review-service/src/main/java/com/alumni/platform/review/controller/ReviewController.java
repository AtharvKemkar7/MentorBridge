package com.alumni.platform.review.controller;

import com.alumni.platform.review.dto.MentorRatingSummary;
import com.alumni.platform.review.dto.ReviewRequest;
import com.alumni.platform.review.dto.ReviewResponse;
import com.alumni.platform.review.dto.PageResponse;
import com.alumni.platform.review.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping
    public ResponseEntity<ReviewResponse> createReview(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody ReviewRequest request) {
        UUID studentId = UUID.fromString(jwt.getSubject());
        ReviewResponse response = reviewService.createReview(studentId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{reviewId}")
    public ResponseEntity<ReviewResponse> getReview(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID reviewId) {
        UUID requesterId = UUID.fromString(jwt.getSubject());
        ReviewResponse response = reviewService.getReview(reviewId, requesterId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{reviewId}")
    public ResponseEntity<ReviewResponse> updateReview(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID reviewId,
            @Valid @RequestBody ReviewRequest request) {
        UUID studentId = UUID.fromString(jwt.getSubject());
        ReviewResponse response = reviewService.updateReview(reviewId, studentId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Void> deleteReview(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID reviewId) {
        UUID studentId = UUID.fromString(jwt.getSubject());
        reviewService.deleteReview(reviewId, studentId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/mentor/{mentorId}")
    public ResponseEntity<PageResponse<ReviewResponse>> getReviewsByMentor(
            @PathVariable UUID mentorId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt,desc") String[] sort) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.fromString(sort[1].toUpperCase()), sort[0]));
        PageResponse<ReviewResponse> response = reviewService.getReviewsByMentor(mentorId, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/student/me")
    public ResponseEntity<PageResponse<ReviewResponse>> getMyReviews(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt,desc") String[] sort) {
        UUID studentId = UUID.fromString(jwt.getSubject());
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.fromString(sort[1].toUpperCase()), sort[0]));
        PageResponse<ReviewResponse> response = reviewService.getReviewsByStudent(studentId, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/mentor/{mentorId}/summary")
    public ResponseEntity<MentorRatingSummary> getMentorRatingSummary(@PathVariable UUID mentorId) {
        MentorRatingSummary summary = reviewService.getMentorRatingSummary(mentorId);
        return ResponseEntity.ok(summary);
    }
}