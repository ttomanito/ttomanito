package com.ssafy.ttomanito.domain.auth.service;

import com.ssafy.ttomanito.domain.auth.repository.RefreshTokenRepository;
import com.ssafy.ttomanito.global.security.jwt.JwtProvider;
import com.ssafy.ttomanito.global.security.token.TokenRevocationService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.util.WebUtils;

import java.time.Instant;

@Component
@RequiredArgsConstructor
public class AuthLogoutManager {

    private final JwtProvider jwtProvider;
    private final TokenRevocationService tokenRevocationService;
    private final RefreshTokenRepository refreshTokenRepository;

    /** 서비스 내부 로그아웃 공통 처리: access/refresh 무효화 + 쿠키 삭제 */
    public void performLocalLogout(HttpServletRequest request, HttpServletResponse response, Authentication auth) {
        // 1) access 토큰 회수
        String accessToken = extractAccessToken(request);
        if (StringUtils.hasText(accessToken) && jwtProvider.isTokenValid(accessToken)) {
            long exp = jwtProvider.parseClaims(accessToken).getExpiration().toInstant().getEpochSecond();
            safeRevokeAccess(accessToken, exp);
        }

        // 2) 사용자 기준 refresh 삭제
        Long userId = null;
        try {
            if (StringUtils.hasText(accessToken) && jwtProvider.isTokenValid(accessToken)) {
                String sub = jwtProvider.parseClaims(accessToken).getSubject();
                userId = Long.valueOf(sub);
            }
        } catch (Exception ignored) { }
        if (userId != null) {
            refreshTokenRepository.deleteByUserId(userId);
        }

        // 3) 쿠키 삭제
        deleteCookie(response, "accessToken");
        deleteCookie(response, "refreshToken");
        deleteCookie(response, "JSESSIONID");
    }

    public String extractAccessToken(HttpServletRequest request) {
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (StringUtils.hasText(header) && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        Cookie c = WebUtils.getCookie(request, "accessToken");
        return c != null ? c.getValue() : null;
    }

    private void safeRevokeAccess(String token, long expEpoch) {
        try {
            long now = Instant.now().getEpochSecond();
            long ttlSec = Math.max(1, expEpoch - now);
            tokenRevocationService.revoke(token, now + ttlSec); // 또는 구현에 맞춰 revoke API 호출
        } catch (Exception ignored) { }
    }

    private void deleteCookie(HttpServletResponse res, String name) {
        ResponseCookie cookie = ResponseCookie.from(name, "")
                .path("/")
                .maxAge(0)
                .httpOnly(true)
                .secure(false) // 여기선 삭제용. set-cookie 파생 속성 일치가 더 안전하면 맞춰 설정
                .sameSite("Lax")
                .build();
        res.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}
