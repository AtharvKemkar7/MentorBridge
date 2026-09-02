package com.alumni.platform.identity.exception;

import org.springframework.http.HttpStatus;

public class RegistrationException extends ApiException {
    public RegistrationException(String message) {
        super(message, HttpStatus.INTERNAL_SERVER_ERROR, "REGISTRATION_FAILED");
    }
}