package com.ssafy.ttomanito.global.security.oauth;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Component
@RequiredArgsConstructor
public class KakaoApiClient {

    private final WebClient webClient = WebClient.builder()
            .baseUrl("https://kapi.kakao.com")
            .build();

    /** 카카오 토큰 무효화(로그아웃) */
    public void logout(String kakaoAccessToken) {
        webClient.post()
                .uri("/v1/user/logout")
                .headers(h -> h.setBearerAuth(kakaoAccessToken))
                .retrieve()
                .bodyToMono(String.class)
                .block(); // 간단히 동기 처리
    }

    /** 연결 끊기 */
    public void unlink(String kakaoAccessToken) {
        webClient.post()
                .uri("/v1/user/unlink")
                .headers(h -> h.setBearerAuth(kakaoAccessToken))
                .retrieve()
                .bodyToMono(String.class)
                .block();
    }
}
