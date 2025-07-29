package com.ssafy.ttomanito.domain.user.service;

import com.ssafy.ttomanito.domain.user.dto.*;
import com.ssafy.ttomanito.domain.user.entity.User;
import com.ssafy.ttomanito.domain.user.entity.User.UserStatus;
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

    public UserDto register(String nickname) {
        User user = User.builder()
                .name(nickname)
                .joinedAt(LocalDateTime.now())
                .status(UserStatus.ACTIVE)
                .build();
        User saved = repo.save(user);
        return toDto(saved);
    }

    public UserDto update(UserUpdateRequest dto) {
        User user = repo.findById(dto.userId())
                .orElseThrow(() -> new RuntimeException("사용자 없음"));
        User updated = user.toBuilder()
                .name(dto.name())
                .build();
        updated = repo.save(updated);
        return toDto(updated);
    }

    @Transactional(readOnly = true)
    public UserDto getMyPage(Long userId) {
        User user = repo.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자 없음"));
        return toDto(user);
    }

    public void delete(Long userId) {
        User user = repo.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자 없음"));
        User withdrawn = user.toBuilder()
                .status(UserStatus.WITHDRAWN)
                .build();
        repo.save(withdrawn);
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

