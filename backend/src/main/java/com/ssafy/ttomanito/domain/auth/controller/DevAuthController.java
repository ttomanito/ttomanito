package com.ssafy.ttomanito.domain.auth.controller;

import com.ssafy.ttomanito.domain.auth.entity.RefreshToken;
import com.ssafy.ttomanito.domain.auth.repository.RefreshTokenRepository;
import com.ssafy.ttomanito.domain.user.entity.User;
import com.ssafy.ttomanito.domain.user.repository.UserRepository;
import com.ssafy.ttomanito.global.exception.NotFoundException;
import com.ssafy.ttomanito.global.security.jwt.JwtProvider;
import com.ssafy.ttomanito.global.security.jwt.JwtToken;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.time.Duration;

/**
 * 개발 환경에서만 켜는 '임의 로그인' 엔드포인트.
 * auth.dev.enabled=true 일 때만 빈이 등록됩니다.
 */
@RestController
@RequestMapping("/auth/dev")
@RequiredArgsConstructor
@ConditionalOnProperty(value = "auth.dev.enabled", havingValue = "true")
@Tag(name = "개발용 로그인", description = "개발 편의를 위한 임의 로그인 API (프로덕션에서 꺼두세요)")
public class DevAuthController {

    private final JwtProvider jwtProvider;
    private final RefreshTokenRepository refreshTokenRepo;
    private final UserRepository userRepository;

    @Value("${jwt.refresh.time}")
    private long refreshTokenTtlMs;

    @Value("${url.redirect.base:https://i13b206.p.ssafy.io}")
    private String frontendRedirectUrl;

    @PostMapping("/login")
    @Operation(summary = "개발용 임의 로그인", description = "userId로 바로 로그인합니다. access/refresh 토큰을 쿠키로 내려줍니다.")
    public ResponseEntity<Void> devLogin(
            @RequestBody DevLoginRequest req,
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        // 1) 유저 검증
        User user = userRepository.findById(req.userId())
                .orElseThrow(() -> new NotFoundException("사용자를 찾을 수 없습니다: " + req.userId()));
        // 상태가 문자열이라면 ACTIVE만 허용(스키마에 'ACTIVE'/'WITHDRAWN' 주석)
        if (!User.UserStatus.ACTIVE.toString().equalsIgnoreCase(user.getStatus().toString())) {
            throw new NotFoundException("비활성 사용자입니다: " + req.userId());
        }

        // 2) JWT 발급
        JwtToken tokens = jwtProvider.generateTokens(user.getUserId(), user.getName());

        // 3) RefreshToken 저장
        long ttlSeconds = Duration.ofMillis(refreshTokenTtlMs).getSeconds();
        refreshTokenRepo.save(new RefreshToken(tokens.getRefreshToken(), String.valueOf(user.getUserId()), ttlSeconds));

        // 4) 쿠키 세팅 (OAuth 성공 핸들러와 동일 정책)
        addCookie(request, response, "accessToken",  tokens.getAccessToken(),  jwtProvider.getAccessTokenTtlMs() / 1000);
        addCookie(request, response, "refreshToken", tokens.getRefreshToken(), ttlSeconds);

        // 프론트로 리다이렉트(원하면 204로 바꿔도 OK)
        response.setStatus(HttpServletResponse.SC_FOUND);
        response.setHeader("Location", frontendRedirectUrl + "/main");
        return ResponseEntity.status(302).build();
    }

    private void addCookie(HttpServletRequest req, HttpServletResponse res,
                           String name, String value, long maxAgeSeconds) {
        boolean isLocal = "localhost".equalsIgnoreCase(req.getServerName())
                || "127.0.0.1".equals(req.getServerName());

        ResponseCookie cookie = ResponseCookie.from(name, value)
                .httpOnly(true)
                .secure(!isLocal)
                .sameSite(isLocal ? "Lax" : "None")
                .path("/")
                .maxAge(maxAgeSeconds)
                .build();

        res.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    public record DevLoginRequest(Long userId) {}
}
