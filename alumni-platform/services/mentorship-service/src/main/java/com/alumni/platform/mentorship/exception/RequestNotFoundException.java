package com.alumni.platform.mentorship.exception;

import org.springframework.http.HttpStatus;

public class RequestNotFoundException extends MentorshipApiException {
    public RequestNotFoundException(String msg) { super(msg, HttpStatus.NOT_FOUND, "REQUEST_NOT_FOUND"); }
}