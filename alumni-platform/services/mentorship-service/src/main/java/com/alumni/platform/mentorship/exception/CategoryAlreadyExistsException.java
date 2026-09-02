package com.alumni.platform.mentorship.exception;

import org.springframework.http.HttpStatus;

public class CategoryAlreadyExistsException extends MentorshipApiException {
    public CategoryAlreadyExistsException(String msg) { super(msg, HttpStatus.CONFLICT, "CATEGORY_ALREADY_EXISTS"); }
}