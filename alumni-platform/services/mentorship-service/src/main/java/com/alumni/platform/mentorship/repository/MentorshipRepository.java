package com.alumni.platform.mentorship.repository;

import com.alumni.platform.mentorship.entity.Mentorship;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MentorshipRepository extends JpaRepository<Mentorship, UUID> {

    List<Mentorship> findByStudentId(UUID studentId);

    List<Mentorship> findByAlumniId(UUID alumniId);

    List<Mentorship> findByStudentIdAndStatus(UUID studentId, Mentorship.MentorshipStatus status);

    List<Mentorship> findByAlumniIdAndStatus(UUID alumniId, Mentorship.MentorshipStatus status);

    Optional<Mentorship> findByStudentIdAndAlumniIdAndStatusIn(UUID studentId, UUID alumniId, List<Mentorship.MentorshipStatus> statuses);

    Optional<Mentorship> findByStudentIdAndAlumniId(UUID studentId, UUID alumniId);

    Page<Mentorship> findByAlumniIdOrderByStartedAtDesc(UUID alumniId, Pageable pageable);

    Page<Mentorship> findByStudentIdOrderByStartedAtDesc(UUID studentId, Pageable pageable);
}