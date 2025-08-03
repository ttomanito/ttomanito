package com.ssafy.ttomanito.domain.mission.dto;

public record MissionResponseDto(
        Long id,
        String title,
        String description,
        String difficulty,
        String channel,
        boolean completed
) {
}
