package com.ssafy.ttomanito.global.security.filter;

import com.ssafy.ttomanito.global.security.jwt.JwtProvider;
import com.ssafy.ttomanito.global.security.token.TokenRevocationService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.WebUtils;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtProvider jwtProvider;
    private final TokenRevocationService tokenRevocationService;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        // WebSocket 시그널링은 토큰 없이 통과
        if (path.startsWith("/ws/")) {
            return true;
        }
        // Swagger / OpenAPI 문서도 토큰 검사 스킵
        return path.startsWith("/v3/api-docs")
                || path.startsWith("/api/v3/api-docs")
                || path.startsWith("/swagger-ui")
                || path.startsWith("/api/swagger-ui")
                || path.equals("/swagger-ui.html")
                || path.equals("/api/swagger-ui.html")
                || path.startsWith("/webjars/");
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain chain)
            throws ServletException, IOException {

        // 이미 인증돼 있으면 토큰 파싱/DB조회 스킵
        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            chain.doFilter(request, response);
            return;
        }

        // 1) Authorization 헤더
        String token = null;
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (StringUtils.hasText(header) && header.startsWith("Bearer ")) {
            token = header.substring(7);
        }

        // 2) 쿠키
        if (token == null) {
            Cookie cookie = WebUtils.getCookie(request, "accessToken");
            if (cookie != null) token = cookie.getValue();
        }

        // 3) 유효성/회수 체크 후 인증 세팅
        if (token != null
                && jwtProvider.isTokenValid(token)
                && !tokenRevocationService.isRevoked(token)) {
            try {
                UserDetails ud = jwtProvider.loadUserFromToken(token);
                var auth = new UsernamePasswordAuthenticationToken(ud, null, ud.getAuthorities());
                auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(auth);
            } catch (UsernameNotFoundException | DisabledException ex) {
                // 쿠키 속성 동일하게 맞춰서 삭제
                deleteCookie(request, response, "accessToken");
                deleteCookie(request, response, "refreshToken");
                SecurityContextHolder.clearContext();
            }
        }

        chain.doFilter(request, response);
    }

    private void deleteCookie(HttpServletRequest req, HttpServletResponse res, String name) {
        boolean isLocal = "localhost".equalsIgnoreCase(req.getServerName()) ||
                "127.0.0.1".equals(req.getServerName());

        ResponseCookie cookie = ResponseCookie.from(name, "")
                .httpOnly(true)
                .secure(!isLocal)
                .sameSite(isLocal ? "Lax" : "None")
                .path("/")
                .maxAge(0)   // 삭제
                .build();

        res.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}
