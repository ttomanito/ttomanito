package com.ssafy.ttomanito.domain.room.dto;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class RoomEvent {
    private final RoomMessageType type;
    private final Long roomId;
    private final Long userId;        // user_id BIGINT
    private final int memberCount;
    private final List<Long> members; // 현재 소켓 접속 중인 userId(Long)

    public static RoomEvent of(RoomMessageType type, Long roomId, Long userId, List<Long> members) {
        return RoomEvent.builder()
                .type(type)
                .roomId(roomId)
                .userId(userId)
                .memberCount(members.size())
                .members(members)
                .build();
    }

    public static RoomEvent state(Long roomId, List<Long> members) {
        return RoomEvent.builder()
                .type(RoomMessageType.STATE)
                .roomId(roomId)
                .memberCount(members.size())
                .members(members)
                .build();
    }
}
