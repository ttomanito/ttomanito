package com.ssafy.ttomanito.domain.room.service;

import org.springframework.stereotype.Component;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

@Component
public class InMemoryRoomSessionRegistry implements RoomSessionRegistry {

    // sessionId -> info
    private final ConcurrentMap<String, SessionInfo> sessions = new ConcurrentHashMap<>();

    // roomId -> set of userIds
    private final ConcurrentMap<Long, Set<Long>> roomMembers = new ConcurrentHashMap<>();

    @Override
    public void join(String sessionId, Long roomId, Long userId) {
        sessions.put(sessionId, new SessionInfo(sessionId, roomId, userId));
        roomMembers
                .computeIfAbsent(roomId, k -> ConcurrentHashMap.newKeySet())
                .add(userId);
    }

    @Override
    public void leaveBySession(String sessionId) {
        SessionInfo info = sessions.remove(sessionId);
        if (info == null) return;

        Long roomId = info.getRoomId();
        Long userId = info.getUserId();

        Set<Long> set = roomMembers.get(roomId);
        if (set != null) {
            set.remove(userId);
            if (set.isEmpty()) {
                roomMembers.remove(roomId, set);
            }
        }
    }

    @Override
    public Optional<SessionInfo> getBySession(String sessionId) {
        return Optional.ofNullable(sessions.get(sessionId));
    }

    @Override
    public List<Long> members(Long roomId) {
        Set<Long> set = roomMembers.get(roomId);
        if (set == null) return List.of();
        return new ArrayList<>(set);
    }
}
