package com.alumni.platform.booking.service;

import com.alumni.platform.booking.dto.request.SlotRequest;
import com.alumni.platform.booking.dto.response.SlotResponse;
import com.alumni.platform.booking.entity.Slot;
import com.alumni.platform.booking.entity.Availability;
import com.alumni.platform.booking.exception.SlotNotFoundException;
import com.alumni.platform.booking.exception.SlotConflictException;
import com.alumni.platform.booking.exception.AvailabilityNotFoundException;
import com.alumni.platform.booking.repository.SlotRepository;
import com.alumni.platform.booking.repository.AvailabilityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class SlotService {

    private final SlotRepository slotRepository;
    private final AvailabilityRepository availabilityRepository;

    @Transactional
    public List<SlotResponse> generateSlots(UUID alumniId, UUID availabilityId) {
        log.info("Generating slots for availability: {}", availabilityId);

        Availability availability = availabilityRepository.findById(availabilityId)
                .orElseThrow(() -> new AvailabilityNotFoundException("Availability not found: " + availabilityId));

        if (!availability.getAlumniId().equals(alumniId)) {
            throw new AvailabilityNotFoundException("Availability not found: " + availabilityId);
        }

        // Delete existing AVAILABLE slots for this availability
        List<Slot> existingSlots = slotRepository.findByAvailabilityId(availabilityId);
        existingSlots.stream()
                .filter(s -> s.getStatus() == Slot.SlotStatus.AVAILABLE)
                .forEach(slotRepository::delete);

        // Generate 30-minute slots
        List<Slot> newSlots = new java.util.ArrayList<>();
        ZonedDateTime start = availability.getDate().atTime(availability.getStartTime()).atZone(java.time.ZoneId.of(availability.getTimezone()));
        ZonedDateTime end = availability.getDate().atTime(availability.getEndTime()).atZone(java.time.ZoneId.of(availability.getTimezone()));

        ZonedDateTime slotStart = start;
        while (slotStart.plusMinutes(30).isBefore(end) || slotStart.plusMinutes(30).isEqual(end)) {
            ZonedDateTime slotEnd = slotStart.plusMinutes(30);
            Slot slot = Slot.builder()
                    .availabilityId(availabilityId)
                    .alumniId(alumniId)
                    .startTime(slotStart)
                    .endTime(slotEnd)
                    .status(Slot.SlotStatus.AVAILABLE)
                    .build();
            newSlots.add(slot);
            slotStart = slotEnd;
        }

        newSlots = slotRepository.saveAll(newSlots);
        log.info("Generated {} slots for availability {}", newSlots.size(), availabilityId);
        return newSlots.stream().map(this::mapToResponse).toList();
    }

    @Transactional
    public SlotResponse createSlot(UUID alumniId, SlotRequest request) {
        log.info("Creating manual slot for alumni: {}", alumniId);

        // Check for overlapping slots
        List<Slot> overlapping = slotRepository.findOverlappingSlots(
                alumniId, Slot.SlotStatus.AVAILABLE, request.getStartTime(), request.getEndTime());
        if (!overlapping.isEmpty()) {
            throw new SlotConflictException("Slot overlaps with existing slot");
        }

        Slot slot = Slot.builder()
                .alumniId(alumniId)
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .status(Slot.SlotStatus.AVAILABLE)
                .build();

        slot = slotRepository.save(slot);
        return mapToResponse(slot);
    }

    @Transactional(readOnly = true)
    public Page<SlotResponse> getSlots(UUID alumniId, Pageable pageable) {
        return slotRepository.findByAlumniIdOrderByStartTimeAsc(alumniId, pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public List<SlotResponse> getAvailableSlots(UUID alumniId, ZonedDateTime start, ZonedDateTime end) {
        return slotRepository.findByAlumniIdAndStartTimeBetween(alumniId, start, end)
                .stream().filter(s -> s.getStatus() == Slot.SlotStatus.AVAILABLE)
                .map(this::mapToResponse).toList();
    }

    @Transactional(readOnly = true)
    public SlotResponse getSlot(UUID alumniId, UUID slotId) {
        Slot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new SlotNotFoundException("Slot not found: " + slotId));
        if (!slot.getAlumniId().equals(alumniId)) {
            throw new SlotNotFoundException("Slot not found: " + slotId);
        }
        return mapToResponse(slot);
    }

    @Transactional
    public void blockSlot(UUID alumniId, UUID slotId) {
        Slot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new SlotNotFoundException("Slot not found: " + slotId));
        if (!slot.getAlumniId().equals(alumniId)) {
            throw new SlotNotFoundException("Slot not found: " + slotId);
        }
        if (slot.getStatus() != Slot.SlotStatus.AVAILABLE) {
            throw new IllegalStateException("Only available slots can be blocked");
        }
        slot.setStatus(Slot.SlotStatus.BLOCKED);
        slotRepository.save(slot);
    }

    @Transactional
    public void unblockSlot(UUID alumniId, UUID slotId) {
        Slot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new SlotNotFoundException("Slot not found: " + slotId));
        if (!slot.getAlumniId().equals(alumniId)) {
            throw new SlotNotFoundException("Slot not found: " + slotId);
        }
        if (slot.getStatus() != Slot.SlotStatus.BLOCKED) {
            throw new IllegalStateException("Only blocked slots can be unblocked");
        }
        slot.setStatus(Slot.SlotStatus.AVAILABLE);
        slotRepository.save(slot);
    }

    @Transactional
    public void deleteSlot(UUID alumniId, UUID slotId) {
        Slot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new SlotNotFoundException("Slot not found: " + slotId));
        if (!slot.getAlumniId().equals(alumniId)) {
            throw new SlotNotFoundException("Slot not found: " + slotId);
        }
        if (slot.getStatus() != Slot.SlotStatus.AVAILABLE && slot.getStatus() != Slot.SlotStatus.BLOCKED) {
            throw new IllegalStateException("Cannot delete booked or cancelled slot");
        }
        slotRepository.delete(slot);
    }

    private SlotResponse mapToResponse(Slot s) {
        return SlotResponse.builder()
                .id(s.getId())
                .availabilityId(s.getAvailabilityId())
                .alumniId(s.getAlumniId())
                .startTime(s.getStartTime())
                .endTime(s.getEndTime())
                .status(s.getStatus())
                .bookedBy(s.getBookedBy())
                .createdAt(s.getCreatedAt())
                .updatedAt(s.getUpdatedAt())
                .build();
    }
}