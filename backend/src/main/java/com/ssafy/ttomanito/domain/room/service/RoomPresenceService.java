package com.ssafy.ttomanito.domain.room.service;

import com.ssafy.ttomanito.domain.room.dto.RoomEvent;
import com.ssafy.ttomanito.domain.room.dto.RoomMessageType;
import com.ssafy.ttomanito.domain.room.event.PresenceEventType;
import com.ssafy.ttomanito.domain.room.event.RoomPresenceEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RoomPresenceService {

    private final RoomSessionRegistry registry;
    private final ApplicationEventPublisher publisher;

    public void joinBySubscribe(String sessionId, Long roomId, Long userId) {
        registry.join(sessionId, roomId, userId);
        publisher.publishEvent(new RoomPresenceEvent(PresenceEventType.ENTER, sessionId, roomId, userId));
    }

    public void exitBySession(String sessionId) {
        registry.getBySession(sessionId).ifPresent(info -> {
            registry.leaveBySession(sessionId);
            publisher.publishEvent(new RoomPresenceEvent(PresenceEventType.EXIT, sessionId, info.getRoomId(), info.getUserId()));
        });
    }
}
