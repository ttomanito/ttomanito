package com.ssafy.ttomanito.global.common.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.nio.charset.StandardCharsets;
import java.util.Date;

@RequiredArgsConstructor
@Component
public class JwtProvider {
    @Value("${jwt.access.time}")
    private long accessTime;

    @Value("${jwt.refresh.time}")
    private long refreshTime;

    @Value("${jwt.secret}")
    private String secretKey;

    private final @Lazy UserDetailsService userDetailsService;

    public JwtToken issueTokens(Long userId, String username) {
        Claims accessClaims = makeAccessClaims(userId, username);
        Claims refreshClaims = makeRefreshClaims(userId);
        return JwtToken.builder()
                .accessToken(generateToken(accessClaims, accessTime))
                .refreshToken(generateToken(refreshClaims, refreshTime))
                .build();
    }

    private Claims makeAccessClaims(Long userId, String username) {
        Claims claims = Jwts.claims();
        claims.setSubject(String.valueOf(userId));
        claims.put("username", username);
        return claims;
    }

    private Claims makeRefreshClaims(Long userId) {
        Claims claims = Jwts.claims();
        claims.setSubject(String.valueOf(userId));
        return claims;
    }

    public String generateToken(Claims claims, long ttlMillis) {
        long now = System.currentTimeMillis();
        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(new Date(now))
                .setExpiration(new Date(now + ttlMillis))
                .signWith(Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8)), SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean validate(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8)))
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public String resolveToken(String header) {
        if (StringUtils.hasText(header) && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }

    public Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8)))
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public UserDetails getUserDetails(String token) {
        String userId = getClaims(token).getSubject();
        return userDetailsService.loadUserByUsername(userId);
    }

    public Authentication getAuthentication(String token) {
        UserDetails userDetails = getUserDetails(token);
        return new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
    }
}