package com.ssafy.ttomanito.domain.chatting.controller;

import com.ssafy.ttomanito.domain.chatting.message.dto.ChatMessageDto;
import com.ssafy.ttomanito.domain.chatting.message.dto.HistoryRequest;
import com.ssafy.ttomanito.domain.chatting.service.ChattingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {
    private final ChattingService service;
    private final SimpMessagingTemplate template;

    /**
     * 1) 클라이언트에서 과거 메시지 요청 시
     *    send → /app/chat.history.{chatRoomId}
     *    payload → { "before": "2025-08-07T12:34:56.789" } or { "before": null }
     *    receive → /user/queue/history
     */
    @MessageMapping("/chat.history.{chatRoomId}")
    public void history(
            @DestinationVariable Long chatRoomId,
            @Payload HistoryRequest req,
            Principal principal
    ) {
        LocalDateTime before = null;
        if (req.before() != null && !req.before().isBlank()) {
            before = LocalDateTime.parse(req.before());
        }

        List<ChatMessageDto> history = service.getHistory(chatRoomId, before);

        template.convertAndSendToUser(
                principal.getName(),
                "/queue/history",
                history
        );
    }

    /**
     * 2) 새 메시지 수신 시
     * send → /app/chat.send.{chatRoomId}
     * broadcast → /topic/chat.{chatRoomId}
     */
    @MessageMapping("/chat.send.{chatRoomId}")
    public void sendMessage(@DestinationVariable Long chatRoomId,
                            @Payload ChatMessageDto payload) {
        ChatMessageDto saved = service.saveMessage(
                new ChatMessageDto(
                        chatRoomId,
                        payload.senderRoomUserId(),
                        payload.content(),
                        null
                )
        );
        template.convertAndSend("/topic/chat." + chatRoomId, saved);
    }

    /**
     * 3) 찌르기 요청 시
     * send → /app/chat.poke.{chatRoomId}
     * broadcast → /topic/chat.{chatRoomId}
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
