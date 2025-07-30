package com.ssafy.ttomanito.domain.user.service;

import com.ssafy.ttomanito.domain.oauth.service.OAuthService;
import com.ssafy.ttomanito.domain.user.dto.UserDto;
import com.ssafy.ttomanito.domain.user.entity.User;
import com.ssafy.ttomanito.domain.user.entity.User.UserStatus;
import com.ssafy.ttomanito.domain.user.exception.UserNotFoundException;
import com.ssafy.ttomanito.domain.user.exception.InvalidUserNameException;
import com.ssafy.ttomanito.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {
    private final UserRepository repo;
    private final OAuthService oauthService;

    public UserDto register(String name) {
        if (name == null || name.trim().isEmpty()) {
            throw new InvalidUserNameException();
        }
        User user = User.builder()
                .name(name.trim())
                .joinedAt(LocalDateTime.now())
                .status(UserStatus.ACTIVE)
                .build();
        User saved = repo.save(user);
        return toDto(saved);
    }

    public UserDto update(Long userId, String name) {
        if (name == null || name.trim().isEmpty()) {
            throw new InvalidUserNameException();
        }
        User existing = repo.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));
        User updated = existing.toBuilder()
                .name(name.trim())
                .build();
        User saved = repo.save(updated);
        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public UserDto getMyPage(Long userId) {
        User user = repo.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));
        return toDto(user);
    }

    public void delete(Long userId) {
        User existing = repo.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        User withdrawn = existing.toBuilder()
                .status(UserStatus.WITHDRAWN)
                .build();
        repo.save(withdrawn);

        oauthService.deleteByUserId(userId);
    }

    private UserDto toDto(User u) {
        return new UserDto(
                u.getUserId(),
                u.getName(),
                u.getJoinedAt(),
                u.getStatus()
        );
    }
}
