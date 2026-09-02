package com.alumni.platform.mentorship.exception;

import org.springframework.http.HttpStatus;

public class RequestAlreadyExistsException extends MentorshipApiException {
    public RequestAlreadyExistsException(String msg) { super(msg, HttpStatus.CONFLICT, "REQUEST_ALREADY_EXISTS"); }
}