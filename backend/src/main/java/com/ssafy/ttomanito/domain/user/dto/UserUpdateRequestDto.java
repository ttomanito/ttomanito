package com.ssafy.ttomanito.domain.user.dto;

public record UserUpdateRequestDto(
        Long userId,
        String name
) {}
