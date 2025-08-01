package com.ssafy.ttomanito.domain.room.socket;

import com.ssafy.ttomanito.domain.room.dto.response.WaitingMessage;
import com.ssafy.ttomanito.domain.room.entity.RoomUser;
import com.ssafy.ttomanito.domain.room.repository.RoomUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class WaitingSocketController {
    private final RoomUserRepository roomUserRepository;
    private final SimpMessagingTemplate messagingTemplate;

    // 입장 시 호출
    @MessageMapping("/waiting/enter")
    public void enter(WaitingMessage msg) {
        RoomUser roomUser = roomUserRepository
                .findByRoom_roomIdAndUser_UserId(msg.getRoomId(), msg.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        WaitingMessage response = WaitingMessage.builder()
                .roomId(msg.getRoomId())
                .userId(msg.getUserId())
                .statusMessage(roomUser.getStatusMessage())
                .type(WaitingMessage.MessageType.ENTER)
                .build();

        messagingTemplate.convertAndSend(
                "/topic/waiting/" + msg.getRoomId(),
                response
        );
    }

    @MessageMapping("/waiting/exit")
    public void exit(WaitingMessage msg) {
        WaitingMessage response = WaitingMessage.builder()
                .roomId(msg.getRoomId())
                .userId(msg.getUserId())
                .statusMessage(null)
                .type(WaitingMessage.MessageType.EXIT)
                .build();

        messagingTemplate.convertAndSend(
                "/topic/waiting/" + msg.getRoomId(),
                response
        );
    }
}
