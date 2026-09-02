package com.alumni.platform.identity.exception;

import org.springframework.http.HttpStatus;

public class EmployeeIdAlreadyExistsException extends ApiException {
    public EmployeeIdAlreadyExistsException(String message) {
        super(message, HttpStatus.CONFLICT, "EMPLOYEE_ID_ALREADY_EXISTS");
    }
}