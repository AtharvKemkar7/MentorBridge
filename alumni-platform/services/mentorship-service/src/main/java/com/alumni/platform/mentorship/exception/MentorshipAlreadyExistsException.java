package com.alumni.platform.mentorship.exception;

import org.springframework.http.HttpStatus;

public class MentorshipAlreadyExistsException extends MentorshipApiException {
    public MentorshipAlreadyExistsException(String msg) { super(msg, HttpStatus.CONFLICT, "MENTORSHIP_ALREADY_EXISTS"); }
}