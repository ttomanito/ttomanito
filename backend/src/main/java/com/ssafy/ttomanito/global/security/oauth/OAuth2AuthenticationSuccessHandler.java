package com.ssafy.ttomanito.global.security.oauth;

import com.ssafy.ttomanito.domain.auth.entity.RefreshToken;
import com.ssafy.ttomanito.domain.auth.repository.RefreshTokenRepository;
import com.ssafy.ttomanito.domain.user.dto.UserDto;
import com.ssafy.ttomanito.global.security.jwt.JwtProvider;
import com.ssafy.ttomanito.global.security.jwt.JwtToken;
import com.ssafy.ttomanito.global.security.utils.CookieUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;

import java.io.IOException;
import java.time.Duration;
import java.time.Instant;

@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    private final JwtProvider jwtProvider;
    private final RefreshTokenRepository refreshTokenRepo;
    private final OAuth2AuthorizedClientService authorizedClientService;

    @Value("${url.redirect.base}")
    private String frontendRedirectUrl;

    @Value("${jwt.refresh.time}")
    private long refreshTokenTtlMs;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        try {
            SocialUser principal = (SocialUser) authentication.getPrincipal();
            UserDto user = principal.getUser();

            // 1) 액세스/리프레시 토큰 발급
            JwtToken tokens = jwtProvider.generateTokens(user.userId(), user.name());

            // 2) 리프레시 토큰 저장
            long ttlSeconds = refreshTokenTtlMs / 1000;
            refreshTokenRepo.save(new RefreshToken(
                    tokens.getRefreshToken(),
                    String.valueOf(user.userId()),
                    ttlSeconds
            ));

            // 3) 쿠키로 내려주기(발급/삭제와 동일 속성 유지)
            CookieUtils.addCookie(request, response, "accessToken",
                    tokens.getAccessToken(), jwtProvider.getAccessTokenTtlMs() / 1000);
            CookieUtils.addCookie(request, response, "refreshToken",
                    tokens.getRefreshToken(), refreshTokenTtlMs / 1000);

            // 4) 카카오 액세스 토큰도 동일 속성으로 쿠키에 저장 (있을 때만)
            if (authentication instanceof OAuth2AuthenticationToken oauth) {
                String registrationId = oauth.getAuthorizedClientRegistrationId(); // "kakao"
                OAuth2AuthorizedClient client =
                        authorizedClientService.loadAuthorizedClient(registrationId, oauth.getName());

                if (client != null && client.getAccessToken() != null) {
                    var at = client.getAccessToken();
                    long maxAge = 60; // 최소 60초
                    if (at.getExpiresAt() != null) {
                        maxAge = Math.max(
                                60,
                                Duration.between(Instant.now(), at.getExpiresAt()).getSeconds()
                        );
                    }
                    CookieUtils.addCookie(request, response, "kakaoAccessToken",
                            at.getTokenValue(), maxAge);
                }
            }

            // 5) 프론트로 리다이렉트
            response.sendRedirect(frontendRedirectUrl + "/main");
        } catch (Exception e) {
            String msg = java.net.URLEncoder.encode(e.getMessage(), java.nio.charset.StandardCharsets.UTF_8);
            response.sendRedirect(frontendRedirectUrl + "/login?error=" + msg);
        }
    }
}
