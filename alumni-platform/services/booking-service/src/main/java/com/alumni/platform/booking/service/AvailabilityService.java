package com.alumni.platform.booking.service;

import com.alumni.platform.booking.dto.request.AvailabilityRequest;
import com.alumni.platform.booking.dto.response.AvailabilityResponse;
import com.alumni.platform.booking.entity.Availability;
import com.alumni.platform.booking.exception.AvailabilityNotFoundException;
import com.alumni.platform.booking.exception.AvailabilityConflictException;
import com.alumni.platform.booking.repository.AvailabilityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AvailabilityService {

    private final AvailabilityRepository availabilityRepository;

    @Transactional
    public AvailabilityResponse createAvailability(UUID alumniId, AvailabilityRequest request) {
        log.info("Creating availability for alumni: {}", alumniId);

        // Check for overlapping availabilities
        List<Availability> overlapping = availabilityRepository.findOverlappingAvailabilities(
                alumniId, request.getDate(), request.getStartTime(), request.getEndTime());
        if (!overlapping.isEmpty()) {
            throw new AvailabilityConflictException("Availability overlaps with existing entry");
        }

        Availability availability = Availability.builder()
                .alumniId(alumniId)
                .date(request.getDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .timezone(request.getTimezone())
                .isRecurring(request.getIsRecurring())
                .recurrencePattern(request.getRecurrencePattern())
                .recurrenceEndDate(request.getRecurrenceEndDate())
                .notes(request.getNotes())
                .build();

        availability = availabilityRepository.save(availability);
        log.info("Created availability: {}", availability.getId());
        return mapToResponse(availability);
    }

    @Transactional(readOnly = true)
    public Page<AvailabilityResponse> getAvailabilities(UUID alumniId, Pageable pageable) {
        return availabilityRepository.findByAlumniIdOrderByDateDesc(alumniId, pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public List<AvailabilityResponse> getAvailabilitiesByDateRange(UUID alumniId, LocalDate start, LocalDate end) {
        return availabilityRepository.findByAlumniIdAndDateBetween(alumniId, start, end)
                .stream().map(this::mapToResponse).toList();
    }

    @Transactional(readOnly = true)
    public AvailabilityResponse getAvailability(UUID alumniId, UUID availabilityId) {
        Availability availability = availabilityRepository.findById(availabilityId)
                .orElseThrow(() -> new AvailabilityNotFoundException("Availability not found: " + availabilityId));
        if (!availability.getAlumniId().equals(alumniId)) {
            throw new AvailabilityNotFoundException("Availability not found: " + availabilityId);
        }
        return mapToResponse(availability);
    }

    @Transactional
    public AvailabilityResponse updateAvailability(UUID alumniId, UUID availabilityId, AvailabilityRequest request) {
        log.info("Updating availability: {}", availabilityId);

        Availability availability = availabilityRepository.findById(availabilityId)
                .orElseThrow(() -> new AvailabilityNotFoundException("Availability not found: " + availabilityId));

        if (!availability.getAlumniId().equals(alumniId)) {
            throw new AvailabilityNotFoundException("Availability not found: " + availabilityId);
        }

        // Check for overlaps excluding self
        List<Availability> overlapping = availabilityRepository.findOverlappingAvailabilities(
                alumniId, request.getDate(), request.getStartTime(), request.getEndTime());
        if (overlapping.stream().anyMatch(a -> !a.getId().equals(availabilityId))) {
            throw new AvailabilityConflictException("Updated availability would overlap with another");
        }

        availability.setDate(request.getDate());
        availability.setStartTime(request.getStartTime());
        availability.setEndTime(request.getEndTime());
        availability.setTimezone(request.getTimezone());
        availability.setIsRecurring(request.getIsRecurring());
        availability.setRecurrencePattern(request.getRecurrencePattern());
        availability.setRecurrenceEndDate(request.getRecurrenceEndDate());
        availability.setNotes(request.getNotes());

        availability = availabilityRepository.save(availability);
        return mapToResponse(availability);
    }

    @Transactional
    public void deleteAvailability(UUID alumniId, UUID availabilityId) {
        log.info("Deleting availability: {}", availabilityId);

        Availability availability = availabilityRepository.findById(availabilityId)
                .orElseThrow(() -> new AvailabilityNotFoundException("Availability not found: " + availabilityId));

        if (!availability.getAlumniId().equals(alumniId)) {
            throw new AvailabilityNotFoundException("Availability not found: " + availabilityId);
        }

        availabilityRepository.delete(availability);
    }

    private AvailabilityResponse mapToResponse(Availability a) {
        return AvailabilityResponse.builder()
                .id(a.getId())
                .alumniId(a.getAlumniId())
                .date(a.getDate())
                .startTime(a.getStartTime())
                .endTime(a.getEndTime())
                .timezone(a.getTimezone())
                .isRecurring(a.getIsRecurring())
                .recurrencePattern(a.getRecurrencePattern())
                .recurrenceEndDate(a.getRecurrenceEndDate())
                .notes(a.getNotes())
                .createdAt(a.getCreatedAt())
                .updatedAt(a.getUpdatedAt())
                .build();
    }
}