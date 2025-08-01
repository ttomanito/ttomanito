package com.ssafy.ttomanito.domain.auth.controller;

import com.ssafy.ttomanito.domain.auth.dto.AccessTokenResponse;
import com.ssafy.ttomanito.domain.auth.service.AuthService;
import com.ssafy.ttomanito.global.security.jwt.JwtProvider;
import com.ssafy.ttomanito.global.security.jwt.JwtToken;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
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
@Tag(name = "Auth", description = "인증 API")
public class AuthController {

    private final AuthService authService;
    private final JwtProvider jwtProvider;

    @Operation(summary = "Refresh Access Token", description = "리프레시 토큰으로 액세스 토큰을 재발급합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "토큰 재발급 성공 (AccessTokenResponse 반환)"),
            @ApiResponse(responseCode = "401", description = "리프레시 토큰 누락 또는 유효하지 않음")
    })
    @PostMapping("/refresh")
    public ResponseEntity<AccessTokenResponse> refreshAccessToken(HttpServletRequest request,
                                                                  HttpServletResponse response) {
        Cookie cookie = WebUtils.getCookie(request, "refreshToken");
        if (cookie == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String refreshToken = cookie.getValue();

        AccessTokenResponse dto = authService.refreshAccessToken(refreshToken);
        return ResponseEntity.ok(dto);
    }
}
