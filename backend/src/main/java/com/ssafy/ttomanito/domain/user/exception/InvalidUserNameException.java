package com.ssafy.ttomanito.domain.user.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class InvalidUserNameException extends RuntimeException {
  public InvalidUserNameException() {
    super("이름 파라미터가 누락되었거나 형식이 잘못되었습니다.");
  }
}