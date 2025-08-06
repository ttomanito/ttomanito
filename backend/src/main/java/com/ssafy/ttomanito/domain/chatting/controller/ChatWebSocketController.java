package com.ssafy.ttomanito.domain.chatting.controller;

import com.ssafy.ttomanito.domain.chatting.message.dto.ChatMessageDto;
import com.ssafy.ttomanito.domain.chatting.service.ChattingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.List;

@Slf4j
@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {
    private final ChattingService service;
    private final SimpMessagingTemplate template;

    /**
     * 1) 클라이언트에서 과거 메시지 요청 시
     *    send: /app/chat.history.{chatRoomId}
     *    receive: /user/queue/history
     */
    @MessageMapping("/chat.history.{chatRoomId}")
    public void history(@DestinationVariable Long chatRoomId,  Principal principal) {
        List<ChatMessageDto> history = service.getHistory(chatRoomId);
        template.convertAndSendToUser(
                principal.getName(),
                "/queue/history",
                history
        );
    }

    /**
     * 2) 새 메시지 수신 시
     *    send: /app/chat.send.{chatRoomId}
     *    broadcast: /topic/chat.{chatRoomId}
     */
    @MessageMapping("/chat.send.{chatRoomId}")
    public void sendMessage(@DestinationVariable Long chatRoomId,
                            @Payload ChatMessageDto payload) {
        // 저장 후 payload.sentAt 세팅
        ChatMessageDto saved = service.saveMessage(
                new ChatMessageDto(
                        chatRoomId,
                        payload.senderRoomUserId(),
                        payload.content(),
                        null
                )
        );
        // 전체 구독자에게 브로드캐스트
        template.convertAndSend("/topic/chat." + chatRoomId, saved);
    }

    /**
     * 3) 찌르기 요청 시
     *    send: /app/chat.poke.{chatRoomId}
     *    broadcast: /topic/chat.{chatRoomId}
     */
    @MessageMapping("/chat.poke.{chatRoomId}")
    public void poke(@DestinationVariable Long chatRoomId,
                     @Payload ChatMessageDto payload) {
        ChatMessageDto saved = service.pokeMessage(
                chatRoomId,
                payload.senderRoomUserId()
        );
        template.convertAndSend("/topic/chat." + chatRoomId, saved);
    }
}
