package com.ssafy.ttomanito.domain.room.socket;

import com.ssafy.ttomanito.domain.room.dto.response.WaitingMessage;
import com.ssafy.ttomanito.domain.room.entity.RoomUser;
import com.ssafy.ttomanito.domain.room.repository.RoomUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Slf4j
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
        log.info("[웹소켓-대기방] 입장 - 방ID={}, 사용자ID={}", msg.getRoomId(), msg.getUserId());
        log.debug("[웹소켓-대기방] 입장 브로드캐스트 - 방ID={}, 사용자ID={}", msg.getRoomId(), msg.getUserId());

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
        log.info("[웹소켓-대기방] 퇴장 - 방ID={}, 사용자ID={}", msg.getRoomId(), msg.getUserId());
        log.debug("[웹소켓-대기방] 퇴장 브로드캐스트 - 방ID={}, 사용자ID={}", msg.getRoomId(), msg.getUserId());

        messagingTemplate.convertAndSend(
                "/topic/waiting/" + msg.getRoomId(),
                response
        );
    }
}
