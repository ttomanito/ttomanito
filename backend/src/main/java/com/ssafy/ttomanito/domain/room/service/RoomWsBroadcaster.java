package com.ssafy.ttomanito.domain.room.service;

import com.ssafy.ttomanito.domain.room.dto.RoomEvent;
import com.ssafy.ttomanito.domain.room.dto.RoomMessageType;
import com.ssafy.ttomanito.domain.room.event.PresenceEventType;
import com.ssafy.ttomanito.domain.room.event.RoomPresenceEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class RoomWsBroadcaster {

    private final SimpMessagingTemplate messagingTemplate;
    private final RoomSessionRegistry registry;

    @EventListener
    public void onPresence(RoomPresenceEvent event) {
        Long roomId = event.roomId();
        Long userId = event.userId();
        RoomMessageType type = (event.type() == PresenceEventType.ENTER)
                ? RoomMessageType.ENTER
                : RoomMessageType.EXIT;

        broadcast(roomId, type, userId);
        broadcastState(roomId);
    }

    private void broadcast(Long roomId, RoomMessageType type, Long userId) {
        List<Long> members = registry.members(roomId);
        messagingTemplate.convertAndSend("/topic/room/" + roomId,
                RoomEvent.of(type, roomId, userId, members));
    }

    private void broadcastState(Long roomId) {
        List<Long> members = registry.members(roomId);
        messagingTemplate.convertAndSend("/topic/room/" + roomId,
                RoomEvent.state(roomId, members));
    }
}
