package com.ssafy.ttomanito.global.security.filter;

import java.io.IOException;
import java.util.stream.Stream;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
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

import com.ssafy.ttomanito.global.security.jwt.JwtProvider;
import com.ssafy.ttomanito.global.security.token.TokenRevocationService;

import lombok.RequiredArgsConstructor;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtProvider jwtProvider;
    private final TokenRevocationService tokenRevocationService;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        return request.getRequestURI().startsWith("/ws/signal");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain)
            throws ServletException, IOException {
        // 1) Authorization 헤더 우선 파싱
        String token = null;
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (StringUtils.hasText(header) && header.startsWith("Bearer ")) {
            token = header.substring(7);
        }

        // 2) 헤더에 없으면 쿠키에서 조회
        if (token == null) {
            Cookie cookie = WebUtils.getCookie(request, "accessToken");
            if (cookie != null) {
                token = cookie.getValue();
            }
        }

        // 3) 토큰 유효성 검사 및 취소 여부 체크
        if (token != null
                && jwtProvider.isTokenValid(token)
                && !tokenRevocationService.isRevoked(token)) {
            try {
                UserDetails ud = jwtProvider.loadUserFromToken(token);
                var auth = new UsernamePasswordAuthenticationToken(
                        ud, null, ud.getAuthorities());
                auth.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );
                SecurityContextHolder.getContext().setAuthentication(auth);
            } catch (UsernameNotFoundException | DisabledException ex) {
                // 사용자 없거나 탈퇴된 경우: 쿠키 삭제 및 컨텍스트 클리어
                Stream.of("accessToken", "refreshToken").forEach(name -> {
                    Cookie del = new Cookie(name, null);
                    del.setPath("/");
                    del.setMaxAge(0);
                    response.addCookie(del);
                });
                SecurityContextHolder.clearContext();
            }
        }

        // 4) 필터 체인 계속
        chain.doFilter(request, response);
    }

}
