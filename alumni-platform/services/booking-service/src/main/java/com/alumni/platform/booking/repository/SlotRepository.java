package com.alumni.platform.booking.repository;

import com.alumni.platform.booking.entity.Slot;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SlotRepository extends JpaRepository<Slot, UUID> {

    List<Slot> findByAvailabilityId(UUID availabilityId);

    List<Slot> findByAlumniId(UUID alumniId);

    List<Slot> findByAlumniIdAndStatus(UUID alumniId, Slot.SlotStatus status);

    List<Slot> findByAlumniIdAndStartTimeBetween(UUID alumniId, ZonedDateTime start, ZonedDateTime end);

    Optional<Slot> findByAvailabilityIdAndStartTime(UUID availabilityId, ZonedDateTime startTime);

    @Query("SELECT s FROM Slot s WHERE s.alumniId = :alumniId AND s.status = :status " +
           "AND s.startTime < :endTime AND s.endTime > :startTime")
    List<Slot> findOverlappingSlots(@Param("alumniId") UUID alumniId,
                                     @Param("status") Slot.SlotStatus status,
                                     @Param("startTime") ZonedDateTime startTime,
                                     @Param("endTime") ZonedDateTime endTime);

    @Query("SELECT s FROM Slot s WHERE s.id = :slotId AND s.status = :status")
    Optional<Slot> findByIdAndStatus(@Param("slotId") UUID slotId, @Param("status") Slot.SlotStatus status);

    Page<Slot> findByAlumniIdOrderByStartTimeAsc(UUID alumniId, org.springframework.data.domain.Pageable pageable);
}