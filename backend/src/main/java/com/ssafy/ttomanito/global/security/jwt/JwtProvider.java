package com.ssafy.ttomanito.global.security.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.nio.charset.StandardCharsets;
import java.util.Date;

@Slf4j
@RequiredArgsConstructor
@Component
@Getter
public class JwtProvider {
    private final @Lazy UserDetailsService userDetailsService;
    @Value("${jwt.access.time}")
    private long accessTokenTtlMs;
    @Value("${jwt.refresh.time}")
    private long refreshTokenTtlMs;
    @Value("${jwt.secret}")
    private String secretKey;

    @PostConstruct
    void init() {
        log.info("jwt.secret length={}, head={}",
                secretKey != null ? secretKey.length() : -1,
                (secretKey != null && secretKey.length() >= 6) ? secretKey.substring(0, 6) : "null");
    }

    /**
     * Access/Refresh JWT를 생성해서 반환합니다.
     */
    public JwtToken generateTokens(Long userId, String username) {
        Claims accessClaims = createAccessClaims(userId, username);
        Claims refreshClaims = createRefreshClaims(userId);

        String accessToken = buildJwt(accessClaims, accessTokenTtlMs);
        String refreshToken = buildJwt(refreshClaims, refreshTokenTtlMs);

        return JwtToken.builder().accessToken(accessToken).refreshToken(refreshToken).build();
    }

    private Claims createAccessClaims(Long userId, String username) {
        Claims c = Jwts.claims();
        c.setSubject(userId.toString());
        c.put("username", username);
        return c;
    }

    private Claims createRefreshClaims(Long userId) {
        Claims c = Jwts.claims();
        c.setSubject(userId.toString());
        return c;
    }

    private String buildJwt(Claims claims, long ttlMs) {
        long now = System.currentTimeMillis();
        return Jwts.builder().setClaims(claims).setIssuedAt(new Date(now)).setExpiration(new Date(now + ttlMs)).signWith(Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8)), SignatureAlgorithm.HS256).compact();
    }

    /**
     * Bearer 헤더에서 순수 토큰 부분만 추출합니다.
     */
    public String extractToken(String header) {
        if (StringUtils.hasText(header) && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }

    /**
     * 토큰 서명·만료 여부를 검사합니다.
     */
    public boolean isTokenValid(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8)))
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (io.jsonwebtoken.JwtException e) {
            log.warn("isTokenValid ex: {}", e.getMessage()); // 👈 실패 원인 로그
            return false;
        }
    }

    /**
     * 토큰에서 클레임(Subject 등)을 파싱해서 반환합니다.
     */
    public Claims parseClaims(String token) {
        return Jwts.parserBuilder().setSigningKey(Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8))).build().parseClaimsJws(token).getBody();
    }

    /**
     * 토큰의 Subject(userId)로 UserDetailsService를 호출합니다.
     */
    public UserDetails loadUserFromToken(String token) {
        String userId = parseClaims(token).getSubject();
        return userDetailsService.loadUserByUsername(userId);
    }
}
