package com.ssafy.ttomanito.domain.rank.dto;

public record RankingDto(
        Long userId,
        Long metricValue,
        Integer rankPosition
) {}
