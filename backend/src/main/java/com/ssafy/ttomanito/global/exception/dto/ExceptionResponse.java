package com.ssafy.ttomanito.global.exception.dto;

import java.time.LocalDateTime;

public record ExceptionResponse(
        String code,
        String message,
        LocalDateTime timestamp
) {
}

