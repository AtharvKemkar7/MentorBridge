package com.alumni.platform.booking.service;

import com.alumni.platform.booking.dto.request.SessionRequest;
import com.alumni.platform.booking.dto.response.SessionResponse;
import com.alumni.platform.booking.entity.Session;
import com.alumni.platform.booking.entity.Booking;
import com.alumni.platform.booking.exception.SessionNotFoundException;
import com.alumni.platform.booking.exception.BookingNotFoundException;
import com.alumni.platform.booking.exception.UnauthorizedException;
import com.alumni.platform.booking.repository.SessionRepository;
import com.alumni.platform.booking.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class SessionService {

    private final SessionRepository sessionRepository;
    private final BookingRepository bookingRepository;

    @Transactional
    public SessionResponse createSession(UUID bookingId, UUID userId, SessionRequest request) {
        log.info("Creating session for booking: {}", bookingId);

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException("Booking not found: " + bookingId));

        if (!booking.getAlumniId().equals(userId)) {
            throw new UnauthorizedException("Only alumni can create sessions");
        }

        if (booking.getStatus() != Booking.BookingStatus.CONFIRMED) {
            throw new IllegalStateException("Only confirmed bookings can have sessions");
        }

        Session session = Session.builder()
                .bookingId(bookingId)
                .studentId(booking.getStudentId())
                .alumniId(booking.getAlumniId())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .meetingLink(request.getMeetingLink())
                .notes(request.getNotes())
                .status(Session.SessionStatus.SCHEDULED)
                .build();

        session = sessionRepository.save(session);
        log.info("Created session: {}", session.getId());
        return mapToResponse(session);
    }

    @Transactional(readOnly = true)
    public Page<SessionResponse> getStudentSessions(UUID studentId, Pageable pageable) {
        return sessionRepository.findByStudentIdOrderByStartTimeDesc(studentId, pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public Page<SessionResponse> getAlumniSessions(UUID alumniId, Pageable pageable) {
        return sessionRepository.findByAlumniIdOrderByStartTimeDesc(alumniId, pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public SessionResponse getSession(UUID userId, UUID sessionId) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new SessionNotFoundException("Session not found: " + sessionId));

        if (!session.getStudentId().equals(userId) && !session.getAlumniId().equals(userId)) {
            throw new UnauthorizedException("Not authorized to view this session");
        }
        return mapToResponse(session);
    }

    @Transactional
    public SessionResponse startSession(UUID userId, UUID sessionId) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new SessionNotFoundException("Session not found: " + sessionId));

        if (!session.getAlumniId().equals(userId)) {
            throw new UnauthorizedException("Only alumni can start sessions");
        }

        if (session.getStatus() != Session.SessionStatus.SCHEDULED) {
            throw new IllegalStateException("Only scheduled sessions can be started");
        }

        session.setStatus(Session.SessionStatus.IN_PROGRESS);
        session = sessionRepository.save(session);
        return mapToResponse(session);
    }

    @Transactional
    public SessionResponse completeSession(UUID userId, UUID sessionId, String notes) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new SessionNotFoundException("Session not found: " + sessionId));

        if (!session.getAlumniId().equals(userId)) {
            throw new UnauthorizedException("Only alumni can complete sessions");
        }

        if (session.getStatus() != Session.SessionStatus.IN_PROGRESS) {
            throw new IllegalStateException("Only in-progress sessions can be completed");
        }

        session.setStatus(Session.SessionStatus.COMPLETED);
        session.setCompletedAt(Instant.now());
        session.setCompletedBy(userId);
        if (notes != null) session.setNotes(notes);
        session = sessionRepository.save(session);

        // Update booking to completed
        Booking booking = bookingRepository.findById(session.getBookingId()).orElse(null);
        if (booking != null && booking.getStatus() == Booking.BookingStatus.CONFIRMED) {
            booking.setStatus(Booking.BookingStatus.COMPLETED);
            bookingRepository.save(booking);
        }

        return mapToResponse(session);
    }

    @Transactional
    public SessionResponse cancelSession(UUID userId, UUID sessionId) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new SessionNotFoundException("Session not found: " + sessionId));

        if (!session.getAlumniId().equals(userId)) {
            throw new UnauthorizedException("Only alumni can cancel sessions");
        }

        if (session.getStatus() == Session.SessionStatus.COMPLETED ||
            session.getStatus() == Session.SessionStatus.CANCELLED ||
            session.getStatus() == Session.SessionStatus.NO_SHOW) {
            throw new IllegalStateException("Session already in terminal state");
        }

        session.setStatus(Session.SessionStatus.CANCELLED);
        session = sessionRepository.save(session);
        return mapToResponse(session);
    }

    @Transactional
    public SessionResponse markNoShow(UUID userId, UUID sessionId) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new SessionNotFoundException("Session not found: " + sessionId));

        if (!session.getAlumniId().equals(userId)) {
            throw new UnauthorizedException("Only alumni can mark no-show");
        }

        if (session.getStatus() != Session.SessionStatus.SCHEDULED &&
            session.getStatus() != Session.SessionStatus.IN_PROGRESS) {
            throw new IllegalStateException("Cannot mark no-show for this session");
        }

        session.setStatus(Session.SessionStatus.NO_SHOW);
        session = sessionRepository.save(session);
        return mapToResponse(session);
    }

    private SessionResponse mapToResponse(Session s) {
        return SessionResponse.builder()
                .id(s.getId())
                .bookingId(s.getBookingId())
                .studentId(s.getStudentId())
                .alumniId(s.getAlumniId())
                .startTime(s.getStartTime())
                .endTime(s.getEndTime())
                .status(s.getStatus())
                .meetingLink(s.getMeetingLink())
                .notes(s.getNotes())
                .completedAt(s.getCompletedAt())
                .completedBy(s.getCompletedBy())
                .createdAt(s.getCreatedAt())
                .updatedAt(s.getUpdatedAt())
                .build();
    }
}