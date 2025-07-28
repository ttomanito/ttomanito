package com.ssafy.ttomanito.global.security.token;

import java.time.Duration;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class TokenRevocationService {
    private final RedisTemplate<String, Object> redisTemplate;
    private static final String REVOKED_TOKEN_KEY_PREFIX = "at:revoked";

    /**
     * 액세스 토큰을 폐기 목록에 추가합니다.
     * @param accessToken - 폐기할 토큰 문자열
     * @param ttl - 토큰 만료까지 남은 시간
     */
    public void revokeToken(String accessToken, Duration ttl) {
        String key = REVOKED_TOKEN_KEY_PREFIX + ":" + accessToken;
        redisTemplate.opsForValue().set(key, true, ttl);
    }

    /**
     * 해당 토큰이 폐기된 상태인지 확인합니다.
     * @param accessToken - 확인할 토큰 문자열
     * @return true면 폐기됨(인증 거부)
     */
    public boolean isTokenRevoked(String accessToken) {
        String key = REVOKED_TOKEN_KEY_PREFIX + ":" + accessToken;
        return redisTemplate.hasKey(key);
    }
}
