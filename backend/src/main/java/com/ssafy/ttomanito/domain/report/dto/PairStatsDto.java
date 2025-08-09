package com.ssafy.ttomanito.domain.report.dto;

/** 2) 두 사람(1:1 방) 공통 통계 */
public record PairStatsDto(
        int pokeCountReceived,    // 내가 받은 찌르기(해당 assignment 방 기준)
        int pokeCountSent,        // 내가 보낸 찌르기
        int pairChatCount,        // 두 사람의 채팅 총합(해당 assignment 방 전체 메시지수)
        long pairCallDurationSec, // 두 사람의 통화 누적(초) — 현재 모델이면 양쪽 duration 합산값
        int myCorrectGuessCount   // 내가 맞춘 횟수(Receiving) / 마니띠가 나를 맞춘 횟수(Giving)
) {}