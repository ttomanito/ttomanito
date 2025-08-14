package com.ssafy.ttomanito.global.exception;

/**
 * HTTP 409 Conflict (자원 충돌)
 */
public class ConflictException extends RuntimeException {
    public ConflictException(String message) {
        super(message);
    }
}
