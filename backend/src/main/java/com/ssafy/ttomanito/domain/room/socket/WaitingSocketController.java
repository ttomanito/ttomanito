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

        RoomUser roomUser = roomUserRepository.findByRoomIdAndUserId(
                msg.getRoomId(), msg.getUserId()
        ).orElseThrow(() -> new IllegalArgumentException("유저 없음"));

        msg = WaitingMessage.builder()
                .roomId(msg.getRoomId())
                .userId(msg.getUserId())
                .statusMessage(roomUser.getStatusMessage()) // ✅ DB에서 가져온 값
                .type(WaitingMessage.MessageType.ENTER)
                .build();

        messagingTemplate.convertAndSend("/topic/waiting/" + msg.getRoomId(), msg);
    }

    @MessageMapping("/waiting/exit")
    public void exit(WaitingMessage msg) {
        WaitingMessage responseMsg = WaitingMessage.builder()
                .roomId(msg.getRoomId())
                .userId(msg.getUserId())
                .statusMessage(null) // 나가는 거라 메시지 안 보냄
                .type(WaitingMessage.MessageType.EXIT)
                .build();

        messagingTemplate.convertAndSend("/topic/waiting/" + msg.getRoomId(), responseMsg);
    }
}
