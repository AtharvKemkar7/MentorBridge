package com.alumni.platform.identity.exception;

import org.springframework.http.HttpStatus;

public class AccountSuspendedException extends ApiException {
    public AccountSuspendedException(String message) {
        super(message, HttpStatus.FORBIDDEN, "ACCOUNT_SUSPENDED");
    }
}