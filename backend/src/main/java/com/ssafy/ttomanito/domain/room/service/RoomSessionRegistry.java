package com.ssafy.ttomanito.domain.room.service;

import java.util.List;
import java.util.Optional;

public interface RoomSessionRegistry {
    void join(String sessionId, Long roomId, Long userId);
    void leaveBySession(String sessionId);
    Optional<SessionInfo> getBySession(String sessionId);
    List<Long> members(Long roomId);
}
