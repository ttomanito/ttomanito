package com.ssafy.ttomanito.security;

import io.jsonwebtoken.*;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Date;
@Slf4j
@Component
public class JwtUtil {

    @Value("${jwt.secret}") // properties: jwt.secret=${JWT_SECRET}
    private String secretKey;

    private byte[] secretBytes() {
        return secretKey.getBytes(StandardCharsets.UTF_8); // RAW 문자열 바이트
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser().setSigningKey(secretBytes()).parseClaimsJws(token); // ← 여기 통일!
            return true;
        } catch (io.jsonwebtoken.ExpiredJwtException e) {
            log.warn("❌ JWT 만료: {}", e.getClaims().getExpiration());
            return false;
        } catch (io.jsonwebtoken.SignatureException e) {
            log.warn("❌ 서명 불일치");
            return false;
        } catch (Exception e) {
            log.warn("❌ 토큰 검증 실패: {}", e.getClass().getSimpleName());
            return false;
        }
    }

    public Long getUserIdFromToken(String token) {
        Claims c = Jwts.parser().setSigningKey(secretBytes()).parseClaimsJws(token).getBody();
        String sub = c.getSubject();
        if (sub != null) {
            try { return Long.parseLong(sub); } catch (NumberFormatException ignore) {}
        }
        return c.get("userId", Long.class); // 혹시 userId 클레임으로 들어오는 경우 대비
    }
}
