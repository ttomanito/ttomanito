package com.ssafy.ttomanito.domain.oauth.service;

import java.util.Optional;

import com.ssafy.ttomanito.domain.oauth.dto.OAuthUserDto;
import com.ssafy.ttomanito.domain.user.entity.User;
import com.ssafy.ttomanito.domain.user.repository.UserRepository;
import org.springframework.stereotype.Service;

import com.ssafy.ttomanito.domain.oauth.entity.OAuthIdentity;
import com.ssafy.ttomanito.domain.oauth.entity.OAuthIdentity.OAuthProvider;
import com.ssafy.ttomanito.domain.oauth.repository.OAuthRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class OAuthService {
    private final OAuthRepository oauthRepository;
    private final UserRepository userRepository;

    @Transactional
    public void createOAuthIdentity(OAuthUserDto oAuthUserDto) {
        User user = userRepository.findById(oAuthUserDto.userId())
                .orElseThrow(() -> new RuntimeException("유저가 없습니다. id=" + oAuthUserDto.userId()));

        OAuthIdentity identity = OAuthIdentity.builder()
                .user(user)
                .provider(oAuthUserDto.provider())
                .providerId(oAuthUserDto.providerId())
                .build();

        oauthRepository.save(identity);
    }

    @Transactional(readOnly = true)
    public Optional<OAuthIdentity> findWithUserByProviderIdAndProvider(String providerId, OAuthProvider provider) {
        return oauthRepository.findWithUserByProviderIdAndProvider(providerId, provider);
    }

    @Transactional
    public void deleteByUserId(Long userId) {
        oauthRepository.deleteByUserId(userId);
    }
}

