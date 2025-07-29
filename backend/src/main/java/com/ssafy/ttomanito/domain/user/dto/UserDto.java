package com.ssafy.ttomanito.domain.user.dto;

import com.ssafy.ttomanito.domain.user.entity.User.UserStatus;
import java.time.LocalDateTime;

public record UserDto(
        Long userId,
        String name,
        LocalDateTime joinedAt,
        UserStatus status
) {}