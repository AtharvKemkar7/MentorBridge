package com.alumni.platform.booking.exception;
import org.springframework.http.HttpStatus;
public class SlotNotAvailableException extends BookingApiException {
    public SlotNotAvailableException(String msg) { super(msg, HttpStatus.CONFLICT, "SLOT_NOT_AVAILABLE"); }
}