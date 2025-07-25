package com.ssafy.ttomanito.domain.room.dto.response;

import com.ssafy.ttomanito.domain.room.model.RoomUser;

public record ParticipantResponse(
        Long userId,
        String statusMessage   // 필요하면 nickname도 추가
) {}