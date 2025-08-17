package com.ssafy.ttomanito.domain.user.service;

import com.ssafy.ttomanito.domain.oauth.service.OAuthService;
import com.ssafy.ttomanito.domain.user.dto.UserDto;
import com.ssafy.ttomanito.domain.user.entity.User;
import com.ssafy.ttomanito.domain.user.entity.User.UserStatus;
import com.ssafy.ttomanito.domain.user.repository.UserRepository;
import com.ssafy.ttomanito.global.exception.BadRequestException;
import com.ssafy.ttomanito.global.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;

@Service
@Transactional
@RequiredArgsConstructor
public class UserService {
    private final UserRepository repo;
    private final OAuthService oauthService;

    public UserDto register(String name) {
        if (name == null || name.trim().isEmpty()) {
            throw new BadRequestException("유효하지 않은 사용자 이름입니다");
        }
        User user = User.builder()
                .name(name.trim())
                .joinedAt(LocalDateTime.now(ZoneId.of("Asia/Seoul")))
                .status(UserStatus.ACTIVE)
                .build();
        User saved = repo.save(user);
        return toDto(saved);
    }

    public UserDto update(Long userId, String name) {
        if (name == null || name.trim().isEmpty()) {
            throw new BadRequestException("유효하지 않은 사용자 이름입니다");
        }
        User existing = repo.findById(userId)
                .orElseThrow(() -> new NotFoundException("사용자를 찾을 수 없습니다: id=" + userId));
        User updated = existing.toBuilder()
                .name(name.trim())
                .build();
        User saved = repo.save(updated);
        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public UserDto getMyPage(Long userId) {
        User user = repo.findById(userId)
                .orElseThrow(() -> new NotFoundException("사용자를 찾을 수 없습니다: id=" + userId));
        return toDto(user);
    }

    public void delete(Long userId) {
        User existing = repo.findById(userId)
                .orElseThrow(() -> new NotFoundException("사용자를 찾을 수 없습니다: id=" + userId));
        User withdrawn = existing.toBuilder()
                .status(UserStatus.WITHDRAWN)
                .build();
        repo.save(withdrawn);
        oauthService.deleteByUserId(userId);
    }

    @Transactional(readOnly = true)
    public String getUserName(Long userId) {
        User user = repo.findById(userId)
                .orElseThrow(() -> new NotFoundException("사용자를 찾을 수 없습니다: id=" + userId));
        return user.getName();
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
