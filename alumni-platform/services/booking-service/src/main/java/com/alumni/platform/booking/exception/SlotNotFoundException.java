package com.alumni.platform.booking.exception;
import org.springframework.http.HttpStatus;
public class SlotNotFoundException extends BookingApiException {
    public SlotNotFoundException(String msg) { super(msg, HttpStatus.NOT_FOUND, "SLOT_NOT_FOUND"); }
}