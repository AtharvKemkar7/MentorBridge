package com.alumni.platform.booking.repository;

import com.alumni.platform.booking.entity.Session;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SessionRepository extends JpaRepository<Session, UUID> {

    List<Session> findByStudentId(UUID studentId);

    List<Session> findByAlumniId(UUID alumniId);

    List<Session> findByStudentIdAndStatus(UUID studentId, Session.SessionStatus status);

    List<Session> findByAlumniIdAndStatus(UUID alumniId, Session.SessionStatus status);

    Optional<Session> findByBookingId(UUID bookingId);

    Page<Session> findByStudentIdOrderByStartTimeDesc(UUID studentId, Pageable pageable);

    Page<Session> findByAlumniIdOrderByStartTimeDesc(UUID alumniId, Pageable pageable);
}