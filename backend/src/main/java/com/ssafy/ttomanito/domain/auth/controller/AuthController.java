package com.ssafy.ttomanito.domain.auth.controller;

import com.ssafy.ttomanito.domain.auth.dto.AccessTokenResponse;
import com.ssafy.ttomanito.domain.auth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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

    @Operation(
            summary = "리프레시 토큰 -> 액세스 토큰",
            description = "리프레시 토큰으로 액세스 토큰을 재발급합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "토큰 재발급 성공 (AccessTokenResponse 반환)"),
            @ApiResponse(responseCode = "401", description = "리프레시 토큰 누락 또는 유효하지 않음")
    })
    @PostMapping("/refresh")
    public ResponseEntity<AccessTokenResponse> refreshAccessToken(HttpServletRequest request) {
        Cookie cookie = WebUtils.getCookie(request, "refreshToken");
        String refreshToken = cookie != null ? cookie.getValue() : null;
        AccessTokenResponse dto = authService.refreshAccessToken(refreshToken);
        return ResponseEntity.ok(dto);
    }
}