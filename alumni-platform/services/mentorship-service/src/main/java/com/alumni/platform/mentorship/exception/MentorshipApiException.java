package com.alumni.platform.mentorship.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public abstract class MentorshipApiException extends RuntimeException {
    private final HttpStatus status;
    private final String code;
    protected MentorshipApiException(String message, HttpStatus status, String code) {
        super(message);
        this.status = status;
        this.code = code;
    }
}