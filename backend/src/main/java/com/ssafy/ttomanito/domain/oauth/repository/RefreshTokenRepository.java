package com.ssafy.ttomanito.domain.oauth.repository;

import org.springframework.stereotype.Repository;

@Repository
public interface RefreshTokenRepository {
    public void save(String userId, String refreshToken, long ttl);
    Long findByRefreshToken(String refreshToken);
    void deleteByRefreshToken(String refreshToken);
}
