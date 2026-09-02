package com.alumni.platform.identity.exception;

import org.springframework.http.HttpStatus;

public class AccountDisabledException extends ApiException {
    public AccountDisabledException(String message) {
        super(message, HttpStatus.FORBIDDEN, "ACCOUNT_DISABLED");
    }
}