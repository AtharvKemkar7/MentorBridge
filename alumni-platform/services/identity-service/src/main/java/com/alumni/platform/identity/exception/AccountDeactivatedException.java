package com.alumni.platform.identity.exception;

import org.springframework.http.HttpStatus;

public class AccountDeactivatedException extends ApiException {
    public AccountDeactivatedException(String message) {
        super(message, HttpStatus.FORBIDDEN, "ACCOUNT_DEACTIVATED");
    }
}