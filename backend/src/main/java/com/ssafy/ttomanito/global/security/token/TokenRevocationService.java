package com.ssafy.ttomanito.global.security.token;

import com.ssafy.ttomanito.global.security.jwt.JwtResolver;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

import java.util.concurrent.TimeUnit;

@RequiredArgsConstructor
@Service
public class TokenRevocationService {
    private final JwtResolver jwtResolver;
    private final RedisTemplate<String, Boolean> redis;
    private static final String REVOKED_TOKEN_KEY_PREFIX = "at:revoked";

    public void revoke(String rawToken) {
        // 1) 토큰에서 만료시간(exp) 클레임을 읽어서 TTL 계산

        var claims = jwtResolver.getClaims(rawToken);
        long nowMs    = System.currentTimeMillis();
        long expMs    = claims.getExpiration().getTime();
        long ttlMs    = Math.max(expMs - nowMs, 0L);

        // 2) Redis에 키로 저장 (value는 아무 값이나 OK)
        String key = REVOKED_TOKEN_KEY_PREFIX + rawToken;
        redis.opsForValue()
                .set(key, Boolean.TRUE, ttlMs, TimeUnit.MILLISECONDS);
    }

    /**
     * 해당 토큰이 폐기된 상태인지 확인합니다.
     */
    public boolean isRevoked(String rawToken) {
        String key = REVOKED_TOKEN_KEY_PREFIX + rawToken;
        return redis.hasKey(key);
    }
}
