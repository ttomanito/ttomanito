package com.ssafy.ttomanito.global.exception.handler;

import com.ssafy.ttomanito.global.exception.*;
import com.ssafy.ttomanito.global.exception.dto.ExceptionResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ExceptionResponse> handleBadRequest(BadRequestException ex) {
        HttpStatus status = HttpStatus.BAD_REQUEST;
        ExceptionResponse body = new ExceptionResponse(
                String.valueOf(status.value()),
                ex.getMessage(),
                LocalDateTime.now()
        );
        return ResponseEntity.status(status).body(body);
    }

    @ExceptionHandler(UnauthenticatedException.class)
    public ResponseEntity<ExceptionResponse> handleUnauthenticated(UnauthenticatedException ex) {
        HttpStatus status = HttpStatus.UNAUTHORIZED;
        ExceptionResponse body = new ExceptionResponse(
                String.valueOf(status.value()),
                ex.getMessage(),
                LocalDateTime.now()
        );
        return ResponseEntity.status(status).body(body);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ExceptionResponse> handleAccessDenied(AccessDeniedException ex) {
        HttpStatus status = HttpStatus.FORBIDDEN;
        ExceptionResponse body = new ExceptionResponse(
                String.valueOf(status.value()),
                "권한이 없습니다",
                LocalDateTime.now()
        );
        return ResponseEntity.status(status).body(body);
    }

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ExceptionResponse> handleNotFound(NotFoundException ex) {
        HttpStatus status = HttpStatus.NOT_FOUND;
        ExceptionResponse body = new ExceptionResponse(
                String.valueOf(status.value()),
                ex.getMessage(),
                LocalDateTime.now()
        );
        return ResponseEntity.status(status).body(body);
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ExceptionResponse> handleBusiness(BusinessException ex) {
        HttpStatus status = ex.getErrorCode().getStatus();
        ExceptionResponse body = new ExceptionResponse(
                String.valueOf(status.value()),
                ex.getErrorCode().getMessage(),
                LocalDateTime.now()
        );
        return ResponseEntity.status(status).body(body);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ExceptionResponse> handleUnknown(Exception ex) {

        HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;
        ExceptionResponse body = new ExceptionResponse(
                String.valueOf(status.value()),
                "서버 내부 오류가 발생했습니다" + ex.getMessage(),
                LocalDateTime.now()
        );
        return ResponseEntity.status(status).body(body);
    }
}
