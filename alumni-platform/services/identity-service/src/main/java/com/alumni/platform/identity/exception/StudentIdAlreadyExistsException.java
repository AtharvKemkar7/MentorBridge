package com.alumni.platform.identity.exception;

import org.springframework.http.HttpStatus;

public class StudentIdAlreadyExistsException extends ApiException {
    public StudentIdAlreadyExistsException(String message) {
        super(message, HttpStatus.CONFLICT, "STUDENT_ID_ALREADY_EXISTS");
    }
}