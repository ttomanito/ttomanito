package com.ssafy.ttomanito.domain.report.dto;

import java.util.List;

public record GivingHelpDto(
        String manitteeName,            // 내가 도와준 사람 이름
        PairStatsDto stats,             // 공통 통계
        List<MissionItemDto> missionsIDid // 내가 수행한 미션 목록
) {}