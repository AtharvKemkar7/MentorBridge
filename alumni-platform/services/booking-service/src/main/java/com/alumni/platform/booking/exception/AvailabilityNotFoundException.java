package com.alumni.platform.booking.exception;
import org.springframework.http.HttpStatus;
public class AvailabilityNotFoundException extends BookingApiException {
    public AvailabilityNotFoundException(String msg) { super(msg, HttpStatus.NOT_FOUND, "AVAILABILITY_NOT_FOUND"); }
}