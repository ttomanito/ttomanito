package com.ssafy.ttomanito.domain.room.dto.response;

public record ParticipantResponse(
        Long userId,
        Long roomUserId,
        String name,          // 참가자 이름 (user.name)
        String statusMessage, // 상태메시지
        Long creatorId       // 방을 만든 사람 ID (room.createId)
) {
}