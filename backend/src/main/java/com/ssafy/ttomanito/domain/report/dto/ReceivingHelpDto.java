package com.ssafy.ttomanito.domain.report.dto;

import java.util.List;

public record ReceivingHelpDto(
        String manittoName,             // 나를 도와준 사람 이름
        PairStatsDto stats,             // 공통 통계
        List<MissionItemDto> missionsFromManitto // 마니또가 수행한 미션 목록
) {}