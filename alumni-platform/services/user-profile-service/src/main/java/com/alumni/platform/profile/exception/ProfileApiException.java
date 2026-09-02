package com.alumni.platform.profile.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public abstract class ProfileApiException extends RuntimeException {

    private final HttpStatus status;
    private final String code;

    protected ProfileApiException(String message, HttpStatus status, String code) {
        super(message);
        this.status = status;
        this.code = code;
    }
}