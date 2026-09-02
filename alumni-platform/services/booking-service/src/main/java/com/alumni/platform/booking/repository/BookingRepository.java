package com.alumni.platform.booking.repository;

import com.alumni.platform.booking.entity.Booking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BookingRepository extends JpaRepository<Booking, UUID> {

    List<Booking> findByStudentId(UUID studentId);

    List<Booking> findByAlumniId(UUID alumniId);

    List<Booking> findByStudentIdAndStatus(UUID studentId, Booking.BookingStatus status);

    List<Booking> findByAlumniIdAndStatus(UUID alumniId, Booking.BookingStatus status);

    Optional<Booking> findBySlotId(UUID slotId);

    Optional<Booking> findByMentorshipId(UUID mentorshipId);

    Optional<Booking> findByStudentIdAndSlotId(UUID studentId, UUID slotId);

    Page<Booking> findByStudentIdOrderByCreatedAtDesc(UUID studentId, org.springframework.data.domain.Pageable pageable);

    Page<Booking> findByAlumniIdOrderByCreatedAtDesc(UUID alumniId, org.springframework.data.domain.Pageable pageable);
}