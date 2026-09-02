package com.alumni.platform.booking.exception;
import org.springframework.http.HttpStatus;
public class SlotConflictException extends BookingApiException {
    public SlotConflictException(String msg) { super(msg, HttpStatus.CONFLICT, "SLOT_CONFLICT"); }
}