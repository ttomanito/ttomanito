package com.ssafy.ttomanito.global.security;

import java.io.IOException;
import java.util.Optional;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Component;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import lombok.RequiredArgsConstructor;

import com.ssafy.ttomanito.global.common.jwt.JwtProvider;
import com.ssafy.ttomanito.global.common.jwt.JwtToken;
import com.ssafy.ttomanito.domain.oauth.entity.OAuthIdentity;
import com.ssafy.ttomanito.domain.oauth.entity.OAuthIdentity.OAuthProvider;
import com.ssafy.ttomanito.domain.oauth.service.OAuthService;
import com.ssafy.ttomanito.domain.user.entity.User;
import com.ssafy.ttomanito.domain.user.service.UserService;
import com.ssafy.ttomanito.domain.user.repository.RefreshTokenRepository;

@Component
@RequiredArgsConstructor
public class Oauth2AuthenticationSuccessHandler implements AuthenticationSuccessHandler {
    private final JwtProvider jwtProvider;
    private final OAuthService oAuthService;
    private final UserService userService;
    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${url.redirect.base}")
    private String redirectUrl;

    @Value("${jwt.refresh.time}")
    private long refreshTime;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication)
            throws IOException, ServletException {
        CustomOidcUser oidcUser = (CustomOidcUser) authentication.getPrincipal();
        String sub = oidcUser.getIdToken().getSubject();
        OAuthProvider provider = oidcUser.getProvider();

        Optional<OAuthIdentity> optIdentity = oAuthService
                .findWithUserByProviderIdAndProvider(sub, provider);
        User user = optIdentity
                .map(OAuthIdentity::getUser)
                .orElseThrow(() -> new IllegalStateException("No linked user for " + sub));

        JwtToken token = jwtProvider.issueTokens(
                user.getUserId(),
                user.getName()
        );

        refreshTokenRepository.save(
                user.getUserId().toString(),
                token.getRefreshToken(),
                refreshTime
        );

        response.addCookie(createCookie("accessToken", token.getAccessToken(), 900));
        response.addCookie(createCookie("refreshToken", token.getRefreshToken(), 86400));
        response.sendRedirect(redirectUrl);
    }

    private Cookie createCookie(String name, String value, int maxAge) {
        Cookie cookie = new Cookie(name, value);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(maxAge);
        return cookie;
    }
}
