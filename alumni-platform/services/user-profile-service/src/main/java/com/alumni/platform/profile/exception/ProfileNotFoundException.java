package com.alumni.platform.profile.exception;

import org.springframework.http.HttpStatus;

public class ProfileNotFoundException extends ProfileApiException {
    public ProfileNotFoundException(String message) {
        super(message, HttpStatus.NOT_FOUND, "PROFILE_NOT_FOUND");
    }
}