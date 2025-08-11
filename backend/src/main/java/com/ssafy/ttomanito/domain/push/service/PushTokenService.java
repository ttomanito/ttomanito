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
        User user = userRepo.findById(userId).orElseThrow();
        repo.findByToken(token).ifPresentOrElse(
                t -> { if (!t.isEnabled()) t.disable(); /* noop: already exists */ },
                () -> repo.save(PushToken.builder().user(user).token(token).enabled(true).build())
        );
    }

    public List<String> findTokensByUserIds(Collection<Long> userIds) {
        return repo.findByUser_UserIdInAndEnabledTrue(userIds).stream()
                .map(PushToken::getToken).toList();
    }

    public void invalidate(String token) {
        repo.deleteByToken(token);
    }
}
