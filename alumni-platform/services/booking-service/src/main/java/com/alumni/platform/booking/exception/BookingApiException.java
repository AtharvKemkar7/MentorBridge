package com.alumni.platform.booking.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public abstract class BookingApiException extends RuntimeException {
    private final HttpStatus status;
    private final String code;
    protected BookingApiException(String msg, HttpStatus status, String code) {
        super(msg); this.status = status; this.code = code;
    }
}