package com.alumni.platform.booking.exception;
import org.springframework.http.HttpStatus;
public class AvailabilityConflictException extends BookingApiException {
    public AvailabilityConflictException(String msg) { super(msg, HttpStatus.CONFLICT, "AVAILABILITY_CONFLICT"); }
}