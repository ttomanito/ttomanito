package com.ssafy.ttomanito.global.security.oauth;

import lombok.Getter;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import com.ssafy.ttomanito.domain.oauth.entity.OAuthIdentity.OAuthProvider;

@Getter
public class SocialUser extends DefaultOidcUser {
    private final OAuthProvider provider;

    public SocialUser(OidcUser delegate, OAuthProvider provider) {
        super(delegate.getAuthorities(), delegate.getIdToken(), delegate.getUserInfo());
        this.provider = provider;
    }
}
