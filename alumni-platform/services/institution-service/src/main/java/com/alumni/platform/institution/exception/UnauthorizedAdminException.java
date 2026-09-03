package com.alumni.platform.institution.exception;

public class UnauthorizedAdminException extends RuntimeException {
    public UnauthorizedAdminException(String message) { super(message); }
}