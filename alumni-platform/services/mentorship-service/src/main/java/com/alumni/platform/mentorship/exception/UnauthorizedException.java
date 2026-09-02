package com.alumni.platform.mentorship.exception;

import org.springframework.http.HttpStatus;

public class UnauthorizedException extends MentorshipApiException {
    public UnauthorizedException(String msg) { super(msg, HttpStatus.FORBIDDEN, "UNAUTHORIZED"); }
}