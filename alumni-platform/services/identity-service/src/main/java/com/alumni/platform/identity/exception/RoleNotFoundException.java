package com.alumni.platform.identity.exception;

import org.springframework.http.HttpStatus;

public class RoleNotFoundException extends ApiException {
    public RoleNotFoundException(String message) {
        super(message, HttpStatus.NOT_FOUND, "ROLE_NOT_FOUND");
    }
}