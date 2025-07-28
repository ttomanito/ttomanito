package com.ssafy.ttomanito.domain.room.socket;

import com.ssafy.ttomanito.domain.room.dto.response.WaitingMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class WaitingSocketController {

    private final SimpMessagingTemplate messagingTemplate;

    // 입장 시 호출
    @MessageMapping("/waiting/enter")
    public void enter(WaitingMessage msg) {
        msg = WaitingMessage.builder()
                .roomId(msg.getRoomId())
                .userId(msg.getUserId())
                .statusMessage(msg.getStatusMessage())
                .type(WaitingMessage.MessageType.ENTER)
                .build();

        messagingTemplate.convertAndSend("/topic/waiting/" + msg.getRoomId(), msg);
    }
}
