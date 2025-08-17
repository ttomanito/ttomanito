package com.ssafy.ttomanito.global.exception.handler;

import com.ssafy.ttomanito.global.exception.*;
import com.ssafy.ttomanito.global.exception.dto.ExceptionResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.time.ZoneId;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ExceptionResponse> handleUnknown(Exception ex, HttpServletRequest req) {
        String errorId = java.util.UUID.randomUUID().toString();

        log.error("[{}] {} {} -> {}", errorId, req.getMethod(), req.getRequestURI(), ex.toString(), ex);

        ExceptionResponse body = new ExceptionResponse(
                String.valueOf(HttpStatus.INTERNAL_SERVER_ERROR.value()),
                "서버 내부 오류가 발생했습니다. errorId=" + errorId,
                LocalDateTime.now(ZoneId.of("Asia/Seoul"))
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ExceptionResponse> handleBadRequest(BadRequestException ex) {
        HttpStatus status = HttpStatus.BAD_REQUEST;
        ExceptionResponse body = new ExceptionResponse(
                String.valueOf(status.value()),
                ex.getMessage(),
                LocalDateTime.now(ZoneId.of("Asia/Seoul"))
        );
        return ResponseEntity.status(status).body(body);
    }

    @ExceptionHandler(UnauthenticatedException.class)
    public ResponseEntity<ExceptionResponse> handleUnauthenticated(UnauthenticatedException ex) {
        HttpStatus status = HttpStatus.UNAUTHORIZED;
        ExceptionResponse body = new ExceptionResponse(
                String.valueOf(status.value()),
                ex.getMessage(),
                LocalDateTime.now(ZoneId.of("Asia/Seoul"))
        );
        return ResponseEntity.status(status).body(body);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ExceptionResponse> handleAccessDenied(AccessDeniedException ex) {
        HttpStatus status = HttpStatus.FORBIDDEN;
        ExceptionResponse body = new ExceptionResponse(
                String.valueOf(status.value()),
                "권한이 없습니다",
                LocalDateTime.now(ZoneId.of("Asia/Seoul"))
        );
        return ResponseEntity.status(status).body(body);
    }

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ExceptionResponse> handleNotFound(NotFoundException ex) {
        HttpStatus status = HttpStatus.NOT_FOUND;
        ExceptionResponse body = new ExceptionResponse(
                String.valueOf(status.value()),
                ex.getMessage(),
                LocalDateTime.now(ZoneId.of("Asia/Seoul"))
        );
        return ResponseEntity.status(status).body(body);
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ExceptionResponse> handleBusiness(BusinessException ex) {
        HttpStatus status = ex.getErrorCode().getStatus();
        ExceptionResponse body = new ExceptionResponse(
                String.valueOf(status.value()),
                ex.getErrorCode().getMessage(),
                LocalDateTime.now(ZoneId.of("Asia/Seoul"))
        );
        return ResponseEntity.status(status).body(body);
    }
}
