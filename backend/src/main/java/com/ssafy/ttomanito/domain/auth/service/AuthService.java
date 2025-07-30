package com.ssafy.ttomanito.domain.auth.service;

import com.ssafy.ttomanito.domain.auth.dto.AccessTokenResponse;
import com.ssafy.ttomanito.domain.auth.entity.RefreshToken;
import com.ssafy.ttomanito.domain.user.entity.User;
import com.ssafy.ttomanito.domain.auth.repository.RefreshTokenRepository;
import com.ssafy.ttomanito.domain.user.repository.UserRepository;
import com.ssafy.ttomanito.global.security.jwt.JwtProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final JwtProvider jwtProvider;
    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;

    public AccessTokenResponse refreshAccessToken(String refreshToken) {
        // 1) 토큰 서명·만료 검사
        if (!jwtProvider.isTokenValid(refreshToken)) {
            refreshTokenRepository.deleteById(refreshToken);
            throw new RuntimeException("Refresh token expired");
        }

        // 2) Redis에서 userId 꺼내기
        RefreshToken stored = refreshTokenRepository
                .findById(refreshToken)
                .orElseThrow(() -> new RuntimeException("Invalid refresh token"));

        // 3) 새로운 Access Token 발급
        User user = userRepository.findById(Long.valueOf(stored.getUserId()))
                .orElseThrow(() -> new RuntimeException("User not found"));

        String newAccessToken = jwtProvider
                .generateTokens(user.getUserId(), user.getName())
                .getAccessToken();

        return AccessTokenResponse.of(newAccessToken);
    }
}

