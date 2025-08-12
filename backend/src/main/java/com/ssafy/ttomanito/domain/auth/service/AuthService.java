package com.ssafy.ttomanito.domain.auth.service;

import com.ssafy.ttomanito.domain.auth.dto.AccessTokenResponse;
import com.ssafy.ttomanito.domain.auth.entity.RefreshToken;
import com.ssafy.ttomanito.domain.auth.repository.RefreshTokenRepository;
import com.ssafy.ttomanito.domain.user.entity.User;
import com.ssafy.ttomanito.domain.user.repository.UserRepository;
import com.ssafy.ttomanito.global.exception.NotFoundException;
import com.ssafy.ttomanito.global.exception.UnauthenticatedException;
import com.ssafy.ttomanito.global.security.jwt.JwtProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
public class AuthService {
    private final JwtProvider jwtProvider;
    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;

    public AccessTokenResponse refreshAccessToken(String refreshToken) {
        // 1) 쿠키가 없거나 비어 있으면 예외
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new UnauthenticatedException("리프레시 토큰이 없습니다");
        }

        // 2) 토큰 유효성 검사
        if (!jwtProvider.isTokenValid(refreshToken)) {
            refreshTokenRepository.deleteById(refreshToken);
            throw new UnauthenticatedException("리프레시 토큰이 만료되었습니다");
        }

        // 3) 저장소에서 리프레시 토큰 조회
        RefreshToken stored = refreshTokenRepository.findById(refreshToken)
                .orElseThrow(() -> new UnauthenticatedException("유효하지 않은 리프레시 토큰"));

        // 4) 사용자 존재 여부 확인
        Long userId = Long.valueOf(stored.getUserId());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("사용자를 찾을 수 없습니다: " + userId));

        // 5) 새로운 Access Token 발급
        String newAccessToken = jwtProvider
                .generateTokens(user.getUserId(), user.getName())
                .getAccessToken();

        return AccessTokenResponse.of(newAccessToken);
    }
}

