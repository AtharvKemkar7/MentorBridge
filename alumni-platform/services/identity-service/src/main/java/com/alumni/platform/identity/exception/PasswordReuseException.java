package com.alumni.platform.identity.exception;

import org.springframework.http.HttpStatus;

public class PasswordReuseException extends ApiException {
    public PasswordReuseException(String message) {
        super(message, HttpStatus.BAD_REQUEST, "PASSWORD_REUSE_NOT_ALLOWED");
    }
}