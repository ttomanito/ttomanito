package com.ssafy.ttomanito.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
public class JwtService {

    private final String secretKey = "yourSecretKey";  // JWT 비밀키

    // JWT 토큰 생성 (userId 포함)
    public String generateToken(Long userId) {
        return Jwts.builder()
                .setSubject("user")
                .claim("userId", userId)  // userId를 페이로드에 포함
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60))  // 1시간 후 만료
                .signWith(SignatureAlgorithm.HS256, secretKey)  // 서명
                .compact();  // 최종 JWT 토큰 생성
    }

    // JWT 토큰에서 userId 추출
    public Long extractUserIdFromToken(String token) {
        Claims claims = Jwts.parser()
                .setSigningKey(secretKey)
                .parseClaimsJws(token.replace("Bearer ", ""))  // "Bearer " 접두어 제거
                .getBody();

        return claims.get("userId", Long.class);  // userId 추출
    }
}
