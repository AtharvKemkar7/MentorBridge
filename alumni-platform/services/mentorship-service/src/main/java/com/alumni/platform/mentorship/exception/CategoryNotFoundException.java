package com.alumni.platform.mentorship.exception;

import org.springframework.http.HttpStatus;

public class CategoryNotFoundException extends MentorshipApiException {
    public CategoryNotFoundException(String msg) { super(msg, HttpStatus.NOT_FOUND, "CATEGORY_NOT_FOUND"); }
}