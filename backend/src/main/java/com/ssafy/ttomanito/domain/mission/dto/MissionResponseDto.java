package com.ssafy.ttomanito.domain.mission.dto;

import com.ssafy.ttomanito.domain.mission.entity.MissionType;

public record MissionResponseDto(
        Long id,
        String title,
        String description,
        String difficulty,
        String channel,
        MissionType type,
        boolean completed,
        Long missionStatusId
) {
}
