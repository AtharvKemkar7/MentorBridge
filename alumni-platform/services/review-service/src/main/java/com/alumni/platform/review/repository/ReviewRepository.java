package com.alumni.platform.review.repository;

import com.alumni.platform.review.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReviewRepository extends JpaRepository<Review, UUID> {

    Optional<Review> findBySessionIdAndStudentId(UUID sessionId, UUID studentId);

    List<Review> findByMentorId(UUID mentorId);

    Page<Review> findByMentorId(UUID mentorId, Pageable pageable);

    Page<Review> findByStudentId(UUID studentId, Pageable pageable);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.mentorId = :mentorId AND r.status = 'APPROVED'")
    Double getAverageRatingForMentor(@Param("mentorId") UUID mentorId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.mentorId = :mentorId AND r.status = 'APPROVED'")
    Long getApprovedCountForMentor(@Param("mentorId") UUID mentorId);
}