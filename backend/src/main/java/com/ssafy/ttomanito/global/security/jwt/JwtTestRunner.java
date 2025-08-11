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
//
//        JwtToken tokens9 = jwtProvider.generateTokens(3L, fakeUsername);
//        JwtToken tokens1 = jwtProvider.generateTokens(10L, fakeUsername);
//        JwtToken tokens2 = jwtProvider.generateTokens(11L, fakeUsername);
//        JwtToken tokens3 = jwtProvider.generateTokens(12L, fakeUsername);
//        JwtToken tokens4 = jwtProvider.generateTokens(13L, fakeUsername);
////        JwtToken tokens5 = jwtProvider.generateTokens(5L, fakeUsername);
////        JwtToken tokens6 = jwtProvider.generateTokens(6L, fakeUsername);
////        JwtToken tokens7 = jwtProvider.generateTokens(7L, fakeUsername);
////        JwtToken tokens8 = jwtProvider.generateTokens(8L, fakeUsername);
//
//        System.out.println("✅ AccessToken9: " + tokens9.getAccessToken());
//        System.out.println("✅ AccessToken10: " + tokens1.getAccessToken());
//        System.out.println("✅ AccessToken11: " + tokens2.getAccessToken());
//        System.out.println("✅ AccessToken12: " + tokens3.getAccessToken());
//        System.out.println("✅ AccessToken13: " + tokens4.getAccessToken());
////        System.out.println("✅ AccessToken5: " + tokens5.getAccessToken());
////        System.out.println("✅ AccessToken6: " + tokens6.getAccessToken());
////        System.out.println("✅ AccessToken7: " + tokens7.getAccessToken());
////        System.out.println("✅ AccessToken8: " + tokens8.getAccessToken());


    }
}
