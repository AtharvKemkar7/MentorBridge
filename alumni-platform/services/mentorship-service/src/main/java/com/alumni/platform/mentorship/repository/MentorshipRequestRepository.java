package com.alumni.platform.mentorship.repository;

import com.alumni.platform.mentorship.entity.MentorshipRequest;
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
public interface MentorshipRequestRepository extends JpaRepository<MentorshipRequest, UUID> {

    List<MentorshipRequest> findByStudentId(UUID studentId);

    List<MentorshipRequest> findByAlumniId(UUID alumniId);

    List<MentorshipRequest> findByStudentIdAndStatus(UUID studentId, MentorshipRequest.RequestStatus status);

    List<MentorshipRequest> findByAlumniIdAndStatus(UUID alumniId, MentorshipRequest.RequestStatus status);

    Optional<MentorshipRequest> findByStudentIdAndAlumniIdAndStatusIn(UUID studentId, UUID alumniId, List<MentorshipRequest.RequestStatus> statuses);

    @Query("SELECT mr FROM MentorshipRequest mr WHERE mr.studentId = :studentId AND mr.alumniId = :alumniId")
    Optional<MentorshipRequest> findByStudentIdAndAlumniId(UUID studentId, UUID alumniId);

    Page<MentorshipRequest> findByAlumniIdOrderByCreatedAtDesc(UUID alumniId, Pageable pageable);

    Page<MentorshipRequest> findByStudentIdOrderByCreatedAtDesc(UUID studentId, Pageable pageable);
}