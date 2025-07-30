package com.ssafy.ttomanito.global.security.oauth;

import com.ssafy.ttomanito.domain.user.dto.UserDto;
import lombok.Getter;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import com.ssafy.ttomanito.domain.oauth.entity.OAuthIdentity.OAuthProvider;

@Getter
public class SocialUser extends DefaultOidcUser {
    private final OAuthProvider provider;
    private final UserDto user; // 로그인된 사용자 정보 저장

    public SocialUser(OidcUser delegate, OAuthProvider provider, UserDto user) {
        super(delegate.getAuthorities(), delegate.getIdToken(), delegate.getUserInfo());
        this.provider = provider;
        this.user = user;
    }

    @Override
    public String getName() {
        return user.name();
    }
}