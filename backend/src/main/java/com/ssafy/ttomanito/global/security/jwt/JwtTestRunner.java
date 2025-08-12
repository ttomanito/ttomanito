package com.ssafy.ttomanito.global.security.jwt;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class JwtTestRunner implements CommandLineRunner {

    private final JwtProvider jwtProvider;

    @Override
    public void run(String... args) {

        Long testUserId = 2L;

        String fakeUsername = "1"; // 실제로 username은 안 쓰지만 JWT 생성 요구사항 충족용

        JwtToken tokens7 = jwtProvider.generateTokens(1L, fakeUsername);


        System.out.println("✅ AccessToken9: " + tokens7.getAccessToken());



    }
}
