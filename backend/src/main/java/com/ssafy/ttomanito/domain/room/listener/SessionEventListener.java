package com.ssafy.ttomanito.domain.room.listener;

import com.ssafy.ttomanito.domain.room.service.RoomPresenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SessionEventListener {

    private final RoomPresenceService presenceService;

    @EventListener
    public void onDisconnect(SessionDisconnectEvent event) {
        presenceService.exitBySession(event.getSessionId());
    }
}
