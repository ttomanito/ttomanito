package com.ssafy.ttomanito.domain.mission.dto;

import com.ssafy.ttomanito.domain.mission.entity.MissionChannel;

import java.time.LocalDate;
import java.util.List;

public record MissionListItemDto(
        Long missionId,
        Long missionStatusId,
        String title,
        String description,
        String difficulty,                // 👈 enum 아님! String
        List<MissionChannel> channels,
        LocalDate missionDate,
        boolean completed
) {
    public static MissionListItemDto from(
            Long missionId,
            Long missionStatusId,
            String title,
            String description,
            String difficulty,
            List<MissionChannel> channels,
            LocalDate missionDate,
            boolean completed
    ) {
        return new MissionListItemDto(missionId,missionStatusId, title, description, difficulty, channels, missionDate, completed);
    }
}
