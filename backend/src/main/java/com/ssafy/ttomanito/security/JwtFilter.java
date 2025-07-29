package com.ssafy.ttomanito.security;

import com.ssafy.ttomanito.security.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain)
            throws ServletException, IOException {

        String uri = request.getRequestURI();
        boolean needsAuth = uri.startsWith("/room"); // room API만 강제

        String authHeader = request.getHeader("Authorization");

        if (!needsAuth) {
            chain.doFilter(request, response);
            return;
        }

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Missing Authorization header");
            return;
        }

        String token = authHeader.substring(7);
        String[] parts = token.split("\\.");
        if (parts.length == 3) {
            String headerJson = new String(Base64.getUrlDecoder().decode(parts[0]), StandardCharsets.UTF_8);
            log.info("JWT header = {}", headerJson); // {"alg":"HS256","typ":"JWT"} 여야 함
        }
        try {
            if (!jwtUtil.validateToken(token)) {
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid JWT");
                return;
            }
            Long userId = jwtUtil.getUserIdFromToken(token);
            if (userId == null) {
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid JWT payload");
                return;
            }
            request.setAttribute("userId", userId);
            chain.doFilter(request, response);
        } catch (io.jsonwebtoken.ExpiredJwtException e) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Token expired");
        } catch (io.jsonwebtoken.SignatureException e) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid signature");
        } catch (Exception e) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Token parse error");
        }
    }
}


