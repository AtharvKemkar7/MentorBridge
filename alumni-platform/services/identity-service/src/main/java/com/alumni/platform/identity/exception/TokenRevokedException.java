package com.alumni.platform.identity.exception;

import org.springframework.http.HttpStatus;

public class TokenRevokedException extends ApiException {
    public TokenRevokedException(String message) {
        super(message, HttpStatus.UNAUTHORIZED, "TOKEN_REVOKED");
    }
}