package com.ssafy.ttomanito.global.exception;

/**
 * HTTP 403 Forbidden
 */
public class AccessDeniedException extends RuntimeException {
    public AccessDeniedException(String message) {
        super(message);
    }
}
