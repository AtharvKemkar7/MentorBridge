package com.alumni.platform.booking.exception;
import org.springframework.http.HttpStatus;
public class SessionNotFoundException extends BookingApiException {
    public SessionNotFoundException(String msg) { super(msg, HttpStatus.NOT_FOUND, "SESSION_NOT_FOUND"); }
}