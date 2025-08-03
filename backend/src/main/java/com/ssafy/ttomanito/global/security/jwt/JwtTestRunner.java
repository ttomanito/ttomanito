package com.ssafy.ttomanito.global.security.jwt;

import com.ssafy.ttomanito.global.security.jwt.JwtProvider;
import com.ssafy.ttomanito.global.security.jwt.JwtToken;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class JwtTestRunner implements CommandLineRunner {

    private final JwtProvider jwtProvider;

    @Override
    public void run(String... args) {
        Long testUserId = 3L;
        String fakeUsername = "1"; // 실제로 username은 안 쓰지만 JWT 생성 요구사항 충족용

        JwtToken tokens = jwtProvider.generateTokens(testUserId, fakeUsername);

        System.out.println("✅ AccessToken: " + tokens.getAccessToken());
        System.out.println("✅ RefreshToken: " + tokens.getRefreshToken());
    }
}
