package com.alumni.platform.review.service;

import com.alumni.platform.review.dto.MentorRatingSummary;
import com.alumni.platform.review.dto.PageResponse;
import com.alumni.platform.review.dto.ReviewRequest;
import com.alumni.platform.review.dto.ReviewResponse;
import com.alumni.platform.review.entity.Review;
import com.alumni.platform.review.entity.ReviewStatus;
import com.alumni.platform.review.exception.DuplicateReviewException;
import com.alumni.platform.review.exception.ReviewNotFoundException;
import com.alumni.platform.review.exception.UnauthorizedReviewAccessException;
import com.alumni.platform.review.repository.ReviewRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final EligibilityClient eligibilityClient;

    public ReviewService(ReviewRepository reviewRepository, EligibilityClient eligibilityClient) {
        this.reviewRepository = reviewRepository;
        this.eligibilityClient = eligibilityClient;
    }

    public ReviewResponse createReview(UUID studentId, ReviewRequest request) {
        // eligibility
        if (!eligibilityClient.isEligible(request.getSessionId(), studentId)) {
            throw new UnauthorizedReviewAccessException("Student not eligible to review this session");
        }
        // duplicate check
        if (reviewRepository.findBySessionIdAndStudentId(request.getSessionId(), studentId).isPresent()) {
            throw new DuplicateReviewException("Review already exists for this session by this student");
        }

        Review review = new Review();
        review.setId(UUID.randomUUID());
        review.setSessionId(request.getSessionId());
        review.setStudentId(studentId);
        // mentorId should be fetched from session; for now expect client to provide? We'll fetch via eligibility client
        UUID mentorId = eligibilityClient.getMentorIdForSession(request.getSessionId());
        review.setMentorId(mentorId);
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        review.setStatus(ReviewStatus.PENDING);

        review = reviewRepository.save(review);
        return toResponse(review);
    }

    @Transactional(readOnly = true)
    public ReviewResponse getReview(UUID reviewId, UUID requesterId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ReviewNotFoundException("Review not found with id " + reviewId));
        // only owner or admin can view? For simplicity allow owner
        if (!review.getStudentId().equals(requesterId)) {
            throw new UnauthorizedReviewAccessException("Not allowed to view this review");
        }
        return toResponse(review);
    }

    public ReviewResponse updateReview(UUID reviewId, UUID studentId, ReviewRequest request) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ReviewNotFoundException("Review not found with id " + reviewId));
        if (!review.getStudentId().equals(studentId)) {
            throw new UnauthorizedReviewAccessException("Only the author can update the review");
        }
        // rating validation already in request
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        // status reset to pending after edit
        review.setStatus(ReviewStatus.PENDING);
        review = reviewRepository.save(review);
        return toResponse(review);
    }

    public void deleteReview(UUID reviewId, UUID studentId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ReviewNotFoundException("Review not found with id " + reviewId));
        if (!review.getStudentId().equals(studentId)) {
            throw new UnauthorizedReviewAccessException("Only the author can delete the review");
        }
        reviewRepository.delete(review);
    }

    @Transactional(readOnly = true)
    public PageResponse<ReviewResponse> getReviewsByMentor(UUID mentorId, Pageable pageable) {
        Page<Review> page = reviewRepository.findByMentorId(mentorId, pageable);
        Page<ReviewResponse> mapped = page.map(this::toResponse);
        return new PageResponse<>(mapped);
    }

    @Transactional(readOnly = true)
    public PageResponse<ReviewResponse> getReviewsByStudent(UUID studentId, Pageable pageable) {
        Page<Review> page = reviewRepository.findByStudentId(studentId, pageable);
        Page<ReviewResponse> mapped = page.map(this::toResponse);
        return new PageResponse<>(mapped);
    }

    @Transactional(readOnly = true)
    public MentorRatingSummary getMentorRatingSummary(UUID mentorId) {
        Double avg = reviewRepository.getAverageRatingForMentor(mentorId);
        Long count = reviewRepository.getApprovedCountForMentor(mentorId);
        return new MentorRatingSummary(mentorId, avg, count);
    }

    private ReviewResponse toResponse(Review r) {
        return new ReviewResponse(
                r.getId(), r.getSessionId(), r.getMentorId(), r.getStudentId(),
                r.getRating(), r.getComment(), r.getStatus(),
                r.getCreatedAt(), r.getUpdatedAt()
        );
    }
}