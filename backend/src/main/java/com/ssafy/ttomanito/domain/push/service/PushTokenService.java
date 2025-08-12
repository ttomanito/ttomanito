package com.ssafy.ttomanito.domain.push.service;

import com.ssafy.ttomanito.domain.push.entity.PushToken;
import com.ssafy.ttomanito.domain.push.repository.PushTokenRepository;
import com.ssafy.ttomanito.domain.user.entity.User;
import com.ssafy.ttomanito.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class PushTokenService {
    private final PushTokenRepository repo;
    private final UserRepository userRepo;

    public void saveToken(Long userId, String token) {
        if (token == null || token.isBlank()) throw new IllegalArgumentException("token is blank");
        User user = userRepo.findById(userId).orElseThrow();

        repo.findByToken(token).ifPresentOrElse(
                t -> {
                    if (!t.isEnabled()) t.enable();
                    if (!t.getUser().getUserId().equals(userId)) {
                        t.changeOwner(user); // 엔티티에 changeOwner(User) 추가되어 있음
                    }
                },
                () -> repo.save(PushToken.builder()
                        .user(user).token(token).enabled(true).build())
        );
    }

    public List<String> findTokensByUserIds(Collection<Long> userIds) {
        return repo.findByUser_UserIdInAndEnabledTrue(userIds).stream()
                .map(PushToken::getToken).toList();
    }

    /** 서버 내부 청소용(소유자 무관) */
    public void invalidate(String token) {
        repo.findByToken(token).ifPresent(PushToken::disable); // soft
    }

    /** 소유자 검증 후 단일 토큰 비활성화 */
    public void invalidateOwned(Long userId, String token) {
        repo.findByTokenAndUser_UserId(token, userId).ifPresent(PushToken::disable);
    }

    /** 내 모든 기기 토큰 비활성화(모든 기기 로그아웃) */
    public void invalidateAllOwned(Long userId) {
        List<PushToken> tokens = repo.findByUser_UserIdAndEnabledTrue(userId);
        tokens.forEach(PushToken::disable); // 엔티티 콜백으로 updatedAt 갱신
    }
}