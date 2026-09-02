package com.alumni.platform.booking.exception;
import org.springframework.http.HttpStatus;
public class UnauthorizedException extends BookingApiException {
    public UnauthorizedException(String msg) { super(msg, HttpStatus.FORBIDDEN, "UNAUTHORIZED"); }
}