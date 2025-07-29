package com.ssafy.ttomanito.domain.user.dto;

public record UserUpdateRequest(
        Long userId,
        String name
) {}
