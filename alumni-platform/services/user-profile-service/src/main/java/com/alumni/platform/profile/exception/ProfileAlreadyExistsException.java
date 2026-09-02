package com.alumni.platform.profile.exception;

import org.springframework.http.HttpStatus;

public class ProfileAlreadyExistsException extends ProfileApiException {
    public ProfileAlreadyExistsException(String message) {
        super(message, HttpStatus.CONFLICT, "PROFILE_ALREADY_EXISTS");
    }
}