package com.ssafy.ttomanito.domain.room.socket;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketEventListener {

    private final SimpMessageSendingOperations messagingTemplate;

    /**
     * key: sessionId
     * value: userId
     */
    @Getter
    private final Map<String, Long> sessionMap = new ConcurrentHashMap<>();

    @EventListener
    public void handleConnect(SessionConnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = accessor.getSessionId();

        String userIdHeader = accessor.getFirstNativeHeader("userId");
        String roomIdHeader = accessor.getFirstNativeHeader("roomId");

        if (userIdHeader == null || roomIdHeader == null) {
            log.warn("Missing headers: userId or roomId");
            return;
        }

        Long userId = Long.valueOf(userIdHeader);
        Long roomId = Long.valueOf(roomIdHeader);
        sessionMap.put(sessionId, userId);

        log.info("🔵 CONNECT: user {} joined room {}, session: {}", userId, roomId, sessionId);

        // 클라이언트들에게 입장 알림 전송
        messagingTemplate.convertAndSend("/topic/waiting/" + roomId,
                new WaitingEventMessage(roomId, userId, "ENTER"));
    }

    @EventListener
    public void handleDisconnect(SessionDisconnectEvent event) {
        String sessionId = StompHeaderAccessor.wrap(event.getMessage()).getSessionId();
        Long userId = sessionMap.remove(sessionId);

        if (userId == null) return;

        log.info("🔴 DISCONNECT: user {} disconnected, session: {}", userId, sessionId);

        // 클라이언트들에게 퇴장 알림 전송
        messagingTemplate.convertAndSend("/topic/waiting/leave",
                new WaitingEventMessage(null, userId, "EXIT"));
    }

    // 내부 전송용 메시지 클래스 (프론트에 JSON으로 보낼 객체)
    public record WaitingEventMessage(Long roomId, Long userId, String type) {}
}
