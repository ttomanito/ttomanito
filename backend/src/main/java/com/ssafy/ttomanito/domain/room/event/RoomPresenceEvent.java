package com.ssafy.ttomanito.domain.room.event;


public record RoomPresenceEvent(
        PresenceEventType type,
        String sessionId,
        Long roomId,
        Long userId
) {}
