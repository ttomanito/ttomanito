package com.ssafy.ttomanito.domain.report.dto;

import com.ssafy.ttomanito.domain.mission.entity.MissionType;

public record MissionItemDto(
        Long missionId,
        String title,
        MissionType type,
        boolean completed,
        java.time.LocalDateTime completedAt
) {}