package com.alumni.platform.booking.service;

import com.alumni.platform.booking.dto.request.BookingRequest;
import com.alumni.platform.booking.dto.response.BookingResponse;
import com.alumni.platform.booking.entity.Booking;
import com.alumni.platform.booking.entity.Slot;
import com.alumni.platform.booking.exception.BookingNotFoundException;
import com.alumni.platform.booking.exception.SlotNotFoundException;
import com.alumni.platform.booking.exception.SlotNotAvailableException;
import com.alumni.platform.booking.exception.UnauthorizedException;
import com.alumni.platform.booking.repository.BookingRepository;
import com.alumni.platform.booking.repository.SlotRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingService {

    private final BookingRepository bookingRepository;
    private final SlotRepository slotRepository;

    @Transactional
    public BookingResponse createBooking(UUID studentId, BookingRequest request) {
        log.info("Student {} creating booking for slot {}", studentId, request.getSlotId());

        // Check if student already has a booking for this slot
        Optional<Booking> existing = bookingRepository.findByStudentIdAndSlotId(studentId, request.getSlotId());
        if (existing.isPresent()) {
            throw new IllegalStateException("Already booked this slot");
        }

        // Get and lock the slot
        Slot slot = slotRepository.findByIdAndStatus(request.getSlotId(), Slot.SlotStatus.AVAILABLE)
                .orElseThrow(() -> new SlotNotAvailableException("Slot not available for booking"));

        // Create booking with optimistic locking on slot
        Booking booking = Booking.builder()
                .studentId(studentId)
                .alumniId(slot.getAlumniId())
                .slotId(slot.getId())
                .mentorshipId(request.getMentorshipId())
                .notes(request.getNotes())
                .status(Booking.BookingStatus.PENDING)
                .build();

        // Mark slot as booked
        slot.setStatus(Slot.SlotStatus.BOOKED);
        slot.setBookedBy(studentId);
        slotRepository.save(slot);

        booking = bookingRepository.save(booking);
        log.info("Created booking: {}", booking.getId());
        return mapToResponse(booking);
    }

    @Transactional(readOnly = true)
    public Page<BookingResponse> getStudentBookings(UUID studentId, Pageable pageable) {
        return bookingRepository.findByStudentIdOrderByCreatedAtDesc(studentId, pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public Page<BookingResponse> getAlumniBookings(UUID alumniId, Pageable pageable) {
        return bookingRepository.findByAlumniIdOrderByCreatedAtDesc(alumniId, pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public BookingResponse getBooking(UUID userId, UUID bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException("Booking not found: " + bookingId));

        if (!booking.getStudentId().equals(userId) && !booking.getAlumniId().equals(userId)) {
            throw new UnauthorizedException("Not authorized to view this booking");
        }
        return mapToResponse(booking);
    }

    @Transactional
    public BookingResponse confirmBooking(UUID alumniId, UUID bookingId) {
        log.info("Alumni {} confirming booking {}", alumniId, bookingId);

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException("Booking not found: " + bookingId));

        if (!booking.getAlumniId().equals(alumniId)) {
            throw new UnauthorizedException("Not authorized to confirm this booking");
        }

        if (booking.getStatus() != Booking.BookingStatus.PENDING) {
            throw new IllegalStateException("Only pending bookings can be confirmed");
        }

        booking.setStatus(Booking.BookingStatus.CONFIRMED);
        booking.setConfirmedAt(Instant.now());
        booking = bookingRepository.save(booking);

        return mapToResponse(booking);
    }

    @Transactional
    public BookingResponse cancelBooking(UUID userId, UUID bookingId, String reason) {
        log.info("User {} cancelling booking {}", userId, bookingId);

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException("Booking not found: " + bookingId));

        if (!booking.getStudentId().equals(userId) && !booking.getAlumniId().equals(userId)) {
            throw new UnauthorizedException("Not authorized to cancel this booking");
        }

        if (booking.getStatus() == Booking.BookingStatus.CANCELLED_BY_STUDENT ||
            booking.getStatus() == Booking.BookingStatus.CANCELLED_BY_ALUMNI ||
            booking.getStatus() == Booking.BookingStatus.COMPLETED ||
            booking.getStatus() == Booking.BookingStatus.NO_SHOW) {
            throw new IllegalStateException("Booking already in terminal state");
        }

        if (booking.getStudentId().equals(userId)) {
            booking.setStatus(Booking.BookingStatus.CANCELLED_BY_STUDENT);
        } else {
            booking.setStatus(Booking.BookingStatus.CANCELLED_BY_ALUMNI);
        }

        booking.setCancelledBy(userId);
        booking.setCancelledReason(reason);
        booking.setCancelledAt(Instant.now());

        // Release the slot
        UUID slotId = booking.getSlotId();
        Slot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new SlotNotFoundException("Slot not found: " + slotId));
        slot.setStatus(Slot.SlotStatus.AVAILABLE);
        slot.setBookedBy(null);
        slotRepository.save(slot);

        booking = bookingRepository.save(booking);
        return mapToResponse(booking);
    }

    private BookingResponse mapToResponse(Booking b) {
        return BookingResponse.builder()
                .id(b.getId())
                .studentId(b.getStudentId())
                .alumniId(b.getAlumniId())
                .slotId(b.getSlotId())
                .mentorshipId(b.getMentorshipId())
                .status(b.getStatus())
                .notes(b.getNotes())
                .cancelledBy(b.getCancelledBy())
                .cancelledReason(b.getCancelledReason())
                .cancelledAt(b.getCancelledAt())
                .confirmedAt(b.getConfirmedAt())
                .createdAt(b.getCreatedAt())
                .updatedAt(b.getUpdatedAt())
                .build();
    }
}