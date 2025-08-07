package com.ssafy.ttomanito.domain.room.socket;

import com.ssafy.ttomanito.domain.room.dto.response.WaitingEventMessage;
import com.ssafy.ttomanito.domain.room.dto.response.WaitingMessage;
import com.ssafy.ttomanito.domain.room.entity.RoomStatus;
import com.ssafy.ttomanito.domain.room.entity.RoomUser;
import com.ssafy.ttomanito.domain.room.repository.RoomUserRepository;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketEventListener {

    private final SimpMessageSendingOperations messagingTemplate;
    private final RoomUserRepository roomUserRepository;

    /**
     * key: sessionId
     * value: userId
     */
    @Getter
    private final Map<String, Long> sessionMap = new ConcurrentHashMap<>();


    @EventListener
    public void handleDisconnect(SessionDisconnectEvent event) {
        String sessionId = StompHeaderAccessor.wrap(event.getMessage()).getSessionId();
        Long userId = sessionMap.remove(sessionId);

        if (userId == null) return;

        log.info("🔴 DISCONNECT: user {} disconnected, session: {}", userId, sessionId);

        // 1) NOT_STARTED, IN_PROGRESS 상태인 방을 기존 메서드로 조회
        List<RoomStatus> activeStatuses = List.of(
                RoomStatus.NOT_STARTED, RoomStatus.IN_PROGRESS
        );
        List<RoomUser> activeRooms = roomUserRepository
                .findActiveRoomsForUser(userId, activeStatuses);

        // 2) 각 RoomUser에서 roomId만 꺼내서 EXIT 이벤트 브로드캐스트
        for (RoomUser ru : activeRooms) {
            Long roomId = ru.getRoom().getRoomId();

            messagingTemplate.convertAndSend(
                    "/topic/waiting/" + roomId,
                    new WaitingEventMessage(roomId, userId, WaitingMessage.MessageType.EXIT)  // ← 이 한 줄만으로 OK
            );
        }
    }

}
