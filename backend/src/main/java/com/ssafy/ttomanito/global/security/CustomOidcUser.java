package com.ssafy.ttomanito.global.security;

import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import com.ssafy.ttomanito.domain.oauth.entity.OAuthIdentity.OAuthProvider;

public class CustomOidcUser extends DefaultOidcUser {
    private final OAuthProvider provider;

    public CustomOidcUser(OidcUser delegate, OAuthProvider provider) {
        super(delegate.getAuthorities(), delegate.getIdToken(), delegate.getUserInfo());
        this.provider = provider;
    }

    public OAuthProvider getProvider() {
        return provider;
    }
}
