package com.alumni.platform.booking.repository;

import com.alumni.platform.booking.entity.Availability;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AvailabilityRepository extends JpaRepository<Availability, UUID> {

    List<Availability> findByAlumniId(UUID alumniId);

    List<Availability> findByAlumniIdAndDateBetween(UUID alumniId, LocalDate start, LocalDate end);

    Optional<Availability> findByAlumniIdAndDate(UUID alumniId, LocalDate date);

    @Query("SELECT a FROM Availability a WHERE a.alumniId = :alumniId AND a.date = :date " +
           "AND a.startTime < :endTime AND a.endTime > :startTime")
    List<Availability> findOverlappingAvailabilities(@Param("alumniId") UUID alumniId,
                                                      @Param("date") LocalDate date,
                                                      @Param("startTime") java.time.LocalTime startTime,
                                                      @Param("endTime") java.time.LocalTime endTime);

    Page<Availability> findByAlumniIdOrderByDateDesc(UUID alumniId, Pageable pageable);
}