package com.alumni.platform.booking.exception;
import org.springframework.http.HttpStatus;
public class BookingNotFoundException extends BookingApiException {
    public BookingNotFoundException(String msg) { super(msg, HttpStatus.NOT_FOUND, "BOOKING_NOT_FOUND"); }
}