package com.ssafy.ttomanito.global.security.oauth;

import com.ssafy.ttomanito.domain.user.dto.UserDto;
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

import java.util.Map;

@Service
@RequiredArgsConstructor
public class SocialUserService extends OidcUserService {
    private final UserService userService;
    private final OAuthService oAuthService;

    @Override
    public OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {
        OidcUser oidcUser = super.loadUser(userRequest);

        OAuthProvider provider = OAuthProvider.from(userRequest.getClientRegistration().getRegistrationId());
        String providerId = oidcUser.getSubject();
        System.out.println( oidcUser.getAttributes() );
        String nickname = oidcUser.getClaim("nickname");

        if (nickname == null) {
            Map<String,Object> kakaoAccount = oidcUser.getClaim("kakao_account");
            if (kakaoAccount != null) {
                Map<String,Object> profile = (Map<String,Object>) kakaoAccount.get("profile");
                nickname = (String) profile.get("nickname");
            }
        }

        if (nickname == null || nickname.isBlank()) {
            nickname = provider.name().toLowerCase() + "_" + providerId;
        }

        if (oAuthService.findWithUserByProviderIdAndProvider(providerId, provider).isEmpty()) {
            UserDto dto = userService.register(nickname);
            oAuthService.createOAuthIdentity(new OAuthUserDto(dto.userId(), providerId, provider));
        }

        return new SocialUser(oidcUser, provider);
    }
}