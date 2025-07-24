package com.ssafy.ttomanito.global.security;

import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

import com.ssafy.ttomanito.domain.oauth.entity.OAuthIdentity.OAuthProvider;
import com.ssafy.ttomanito.domain.oauth.dto.OAuthUserDto;
import com.ssafy.ttomanito.domain.oauth.service.OAuthService;
import com.ssafy.ttomanito.domain.user.service.UserService;
import com.ssafy.ttomanito.domain.user.entity.User;

@Service
@RequiredArgsConstructor
public class CustomOidcUserService extends OidcUserService {
    private final UserService userService;
    private final OAuthService oAuthService;

    @Override
    public OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {
        OidcUser oidcUser = super.loadUser(userRequest);

        OAuthProvider provider = OAuthProvider.from(userRequest.getClientRegistration().getRegistrationId());
        String providerId = oidcUser.getSubject();

        if (oAuthService.findWithUserByProviderIdAndProvider(providerId, provider).isEmpty()) {
            User user = userService.createByOAuth(providerId, provider);
            oAuthService.createOAuthIdentity(new OAuthUserDto(user.getUserId(), providerId, provider));
        }

        return new CustomOidcUser(oidcUser, provider);
    }
}