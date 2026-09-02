package com.alumni.platform.mentorship.exception;

import org.springframework.http.HttpStatus;

public class MentorshipNotFoundException extends MentorshipApiException {
    public MentorshipNotFoundException(String msg) { super(msg, HttpStatus.NOT_FOUND, "MENTORSHIP_NOT_FOUND"); }
}