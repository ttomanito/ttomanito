package com.ssafy.ttomanito.domain.oauth.service;

import java.util.Optional;

import com.ssafy.ttomanito.domain.oauth.dto.OAuthUserDto;
import com.ssafy.ttomanito.domain.user.entity.User;
import com.ssafy.ttomanito.domain.user.repository.UserRepository;
import com.ssafy.ttomanito.global.exception.NotFoundException;
import org.springframework.stereotype.Service;

import com.ssafy.ttomanito.domain.oauth.entity.OAuthIdentity;
import com.ssafy.ttomanito.domain.oauth.entity.OAuthIdentity.OAuthProvider;
import com.ssafy.ttomanito.domain.oauth.repository.OAuthRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
public class OAuthService {
    private final OAuthRepository oauthRepository;
    private final UserRepository userRepository;

    public void createOAuthIdentity(OAuthUserDto dto) {
        User user = userRepository.findById(dto.userId())
                .orElseThrow(() -> new NotFoundException("유저를 찾을 수 없습니다: id=" + dto.userId()));

        OAuthIdentity identity = OAuthIdentity.builder()
                .user(user)
                .provider(dto.provider())
                .providerId(dto.providerId())
                .build();

        oauthRepository.save(identity);
    }

    @Transactional(readOnly = true)
    public Optional<OAuthIdentity> findWithUserByProviderIdAndProvider(String providerId, OAuthProvider provider) {
        return oauthRepository.findWithUserByProviderIdAndProvider(providerId, provider);
    }

    public void deleteByUserId(Long userId) {
        oauthRepository.deleteByUserId(userId);
    }
}

