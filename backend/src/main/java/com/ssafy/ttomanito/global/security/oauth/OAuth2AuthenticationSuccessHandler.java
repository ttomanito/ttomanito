package com.ssafy.ttomanito.global.security.oauth;

import java.io.IOException;

import com.ssafy.ttomanito.domain.auth.entity.RefreshToken;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.ssafy.ttomanito.domain.oauth.entity.OAuthIdentity;
import com.ssafy.ttomanito.domain.oauth.entity.OAuthIdentity.OAuthProvider;
import com.ssafy.ttomanito.domain.auth.repository.RefreshTokenRepository;
import com.ssafy.ttomanito.domain.oauth.service.OAuthService;
import com.ssafy.ttomanito.domain.user.entity.User;
import com.ssafy.ttomanito.global.security.jwt.JwtProvider;
import com.ssafy.ttomanito.global.security.jwt.JwtToken;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler implements AuthenticationSuccessHandler {
    private final JwtProvider jwtProvider;
    private final OAuthService oAuthService;
    private final RefreshTokenRepository refreshTokenRepo;

//    @Value("${url.redirect.base}")
//    private String frontendRedirectUrl;

    @Value("${jwt.refresh.time}")
    private long refreshTokenTtlMs;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication)
            throws IOException, ServletException {

        var oidcUser  = (SocialUser) authentication.getPrincipal();
        String providerId = oidcUser.getIdToken().getSubject();
        OAuthProvider provider = oidcUser.getProvider();

        User user = oAuthService
                .findWithUserByProviderIdAndProvider(providerId, provider)
                .map(OAuthIdentity::getUser)
                .orElseThrow(() -> new IllegalStateException("No linked user for " + providerId));

        JwtToken tokens = jwtProvider.generateTokens(user.getUserId(), user.getName());

        long ttlSeconds = refreshTokenTtlMs / 1000;

        RefreshToken refreshTokenEntity = new RefreshToken(
                tokens.getRefreshToken(),
                user.getUserId().toString(),
                ttlSeconds
        );
        refreshTokenRepo.save(refreshTokenEntity);

        // 쿠키 세팅 (maxAge는 초 단위)
        response.addCookie(buildCookie("accessToken",  tokens.getAccessToken(),  (int)(jwtProvider.getAccessTokenTtlMs() / 1000)));
        response.addCookie(buildCookie("refreshToken", tokens.getRefreshToken(), (int)(refreshTokenTtlMs / 1000)));

//        response.sendRedirect(frontendRedirectUrl + "/main");
    }

    private Cookie buildCookie(String name, String value, int maxAgeSeconds) {
        Cookie cookie = new Cookie(name, value);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(maxAgeSeconds);
        return cookie;
    }
}
