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

//       JwtToken tokens100 = jwtProvider.generateTokens(2L, fakeUsername);
//        JwtToken tokens101 = jwtProvider.generateTokens(101L, fakeUsername);
//        JwtToken tokens102 = jwtProvider.generateTokens(102L, fakeUsername);
//        JwtToken tokens103 = jwtProvider.generateTokens(103L, fakeUsername);
//        JwtToken tokens104 = jwtProvider.generateTokens(104L, fakeUsername);
//        JwtToken tokens105 = jwtProvider.generateTokens(105L, fakeUsername);
//        JwtToken tokens106 = jwtProvider.generateTokens(106L, fakeUsername);
//        JwtToken tokens107 = jwtProvider.generateTokens(107L, fakeUsername);
//        JwtToken tokens108 = jwtProvider.generateTokens(108L, fakeUsername);
//        JwtToken tokens109 = jwtProvider.generateTokens(109L, fakeUsername);
//        JwtToken tokens110 = jwtProvider.generateTokens(110L, fakeUsername);
//        JwtToken tokens111 = jwtProvider.generateTokens(111L, fakeUsername);
//        JwtToken tokens112 = jwtProvider.generateTokens(112L, fakeUsername);
//        JwtToken tokens113 = jwtProvider.generateTokens(113L, fakeUsername);
//        JwtToken tokens114 = jwtProvider.generateTokens(114L, fakeUsername);
//        JwtToken tokens115 = jwtProvider.generateTokens(115L, fakeUsername);
//        JwtToken tokens116 = jwtProvider.generateTokens(116L, fakeUsername);
//        JwtToken tokens117 = jwtProvider.generateTokens(117L, fakeUsername);
//        JwtToken tokens118 = jwtProvider.generateTokens(118L, fakeUsername);
//        JwtToken tokens119 = jwtProvider.generateTokens(119L, fakeUsername);
//
//
//    System.out.println("✅ AccessToken100: " + tokens100.getAccessToken());
//        System.out.println("✅ AccessToken101: " + tokens101.getAccessToken());
//        System.out.println("✅ AccessToken102: " + tokens102.getAccessToken());
//        System.out.println("✅ AccessToken103: " + tokens103.getAccessToken());
//        System.out.println("✅ AccessToken104: " + tokens104.getAccessToken());
//        System.out.println("✅ AccessToken105: " + tokens105.getAccessToken());
//        System.out.println("✅ AccessToken106: " + tokens106.getAccessToken());
//        System.out.println("✅ AccessToken107: " + tokens107.getAccessToken());
//        System.out.println("✅ AccessToken108: " + tokens108.getAccessToken());
//        System.out.println("✅ AccessToken109: " + tokens109.getAccessToken());
//        System.out.println("✅ AccessToken110: " + tokens110.getAccessToken());
//        System.out.println("✅ AccessToken111: " + tokens111.getAccessToken());
//        System.out.println("✅ AccessToken112: " + tokens112.getAccessToken());
//        System.out.println("✅ AccessToken113: " + tokens113.getAccessToken());
//        System.out.println("✅ AccessToken114: " + tokens114.getAccessToken());
//        System.out.println("✅ AccessToken115: " + tokens115.getAccessToken());
//        System.out.println("✅ AccessToken116: " + tokens116.getAccessToken());
//        System.out.println("✅ AccessToken117: " + tokens117.getAccessToken());
//        System.out.println("✅ AccessToken118: " + tokens118.getAccessToken());
//        System.out.println("✅ AccessToken119: " + tokens119.getAccessToken());



    }
}
