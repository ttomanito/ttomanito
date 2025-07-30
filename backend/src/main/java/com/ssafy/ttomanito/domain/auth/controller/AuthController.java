package com.ssafy.ttomanito.domain.auth.controller;

import com.ssafy.ttomanito.domain.auth.dto.AccessTokenResponse;
import com.ssafy.ttomanito.domain.auth.service.AuthService;
import com.ssafy.ttomanito.global.security.jwt.JwtProvider;
import com.ssafy.ttomanito.global.security.jwt.JwtToken;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.WebUtils;

@RequiredArgsConstructor
@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;
    private final JwtProvider jwtProvider;

    @PostMapping("/refresh")
    public ResponseEntity<AccessTokenResponse> refreshAccessToken(HttpServletRequest request,
                                                                  HttpServletResponse response) {
        Cookie cookie = WebUtils.getCookie(request, "refreshToken");
        if (cookie == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String refreshToken = cookie.getValue();

        return ResponseEntity.ok(
                authService.refreshAccessToken(refreshToken)
        );
    }
    @GetMapping("/token")
    public ResponseEntity<JwtToken> generate() {
        JwtToken token = jwtProvider.generateTokens(1004L, "nini");
        return ResponseEntity.ok(token);
    }
}
