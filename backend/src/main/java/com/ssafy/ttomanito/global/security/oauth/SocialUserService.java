package com.ssafy.ttomanito.global.security.oauth;

import com.ssafy.ttomanito.domain.oauth.dto.OAuthUserDto;
import com.ssafy.ttomanito.domain.oauth.entity.OAuthIdentity;
import com.ssafy.ttomanito.domain.oauth.entity.OAuthIdentity.OAuthProvider;
import com.ssafy.ttomanito.domain.oauth.service.OAuthService;
import com.ssafy.ttomanito.domain.user.dto.UserDto;
import com.ssafy.ttomanito.domain.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class SocialUserService extends OidcUserService {
    private final UserService userService;
    private final OAuthService oAuthService;

    @Override
    public OidcUser loadUser(OidcUserRequest request) throws OAuth2AuthenticationException {
        OidcUser oidc = super.loadUser(request);
        OAuthProvider provider = OAuthProvider.from(request.getClientRegistration().getRegistrationId());
        String providerId = oidc.getSubject();

        // 닉네임 추출 로직
        String nickname = extractNickname(oidc, provider, providerId);

        // 사용자 생성 또는 기존 조회
        OAuthIdentity identity = oAuthService.findWithUserByProviderIdAndProvider(providerId, provider)
                .orElseGet(() -> {
                    UserDto newUser = userService.register(nickname);
                    oAuthService.createOAuthIdentity(new OAuthUserDto(newUser.userId(), providerId, provider));
                    return oAuthService.findWithUserByProviderIdAndProvider(providerId, provider)
                            .orElseThrow();
                });

        // UserDto 생성
        UserDto userDto = new UserDto(
                identity.getUser().getUserId(),
                identity.getUser().getName(),
                identity.getUser().getJoinedAt(),
                identity.getUser().getStatus()
        );

        // SocialUser에 UserDto 포함하여 반환
        return new SocialUser(oidc, provider, userDto);
    }

    // 닉네임 추출 헬퍼
    @SuppressWarnings("unchecked")
    private String extractNickname(OidcUser oidc, OAuthProvider provider, String providerId) {
        // 1. 기본 nickname 클레임
        String nickname = oidc.getClaim("nickname");

        // 2. 비어 있으면 kakao_account.profile.nickname 시도
        if (!StringUtils.hasText(nickname)) {
            Map<String, Object> kakaoAccount = oidc.getClaim("kakao_account");
            Map<String, Object> profile = kakaoAccount != null
                    ? (Map<String, Object>) kakaoAccount.get("profile")
                    : null;
            nickname = (profile != null)
                    ? (String) profile.get("nickname")
                    : null;
        }

        // 3. 그래도 비어 있으면 provider_substitute
        if (!StringUtils.hasText(nickname)) {
            nickname = provider.name().toLowerCase() + "_" + providerId;
        }
        return nickname;
    }
}