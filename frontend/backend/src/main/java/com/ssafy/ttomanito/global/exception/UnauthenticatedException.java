package com.ssafy.ttomanito.global.exception;

/**
 * HTTP 401 Unauthorized (인증 필요)
 */
public class UnauthenticatedException extends RuntimeException {
    public UnauthenticatedException(String message) {
        super(message);
    }
}
