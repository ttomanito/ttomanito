package com.ssafy.ttomanito.global.security.filter;

import com.ssafy.ttomanito.global.security.jwt.JwtProvider;
import com.ssafy.ttomanito.global.security.token.TokenRevocationService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;
import org.springframework.web.util.WebUtils;

import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtHandshakeInterceptor implements HandshakeInterceptor {

    public static final String ATTR_JWT = "JWT_TOKEN";

    private final JwtProvider jwtProvider;
    private final TokenRevocationService tokenRevocationService;

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) {
        if (request instanceof ServletServerHttpRequest servlet) {
            HttpServletRequest req = servlet.getServletRequest();

            String token = resolveFromHeader(req);
            if (token == null) token = resolveFromCookie(req, "accessToken");

            if (token != null && jwtProvider.isTokenValid(token) && !tokenRevocationService.isRevoked(token)) {
                attributes.put(ATTR_JWT, token);
                log.debug("[WS] JWT attached to session attributes");
            } else {
                log.debug("[WS] No valid JWT found at handshake");
            }
        }
        return true;
    }

    @Override public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                         WebSocketHandler wsHandler, Exception ex) {}

    private String resolveFromHeader(HttpServletRequest req) {
        String h = req.getHeader(HttpHeaders.AUTHORIZATION);
        if (StringUtils.hasText(h) && h.startsWith("Bearer ")) return h.substring(7);
        return null;
    }

    private String resolveFromCookie(HttpServletRequest req, String name) {
        Cookie c = WebUtils.getCookie(req, name);
        return c != null ? c.getValue() : null;
    }
}
