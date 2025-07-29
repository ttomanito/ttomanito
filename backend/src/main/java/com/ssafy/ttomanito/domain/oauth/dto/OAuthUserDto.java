package com.ssafy.ttomanito.domain.oauth.dto;

import com.ssafy.ttomanito.domain.oauth.entity.OAuthIdentity.OAuthProvider;

public record OAuthUserDto(
        Long userId,
        String providerId,
        OAuthProvider provider
) {}
