package com.ssafy.ttomanito.domain.chatting.controller;

import com.ssafy.ttomanito.domain.chatting.message.dto.ChatMessageDto;
import com.ssafy.ttomanito.domain.chatting.message.dto.HistoryRequest;
import com.ssafy.ttomanito.domain.chatting.service.ChattingService;
import com.ssafy.ttomanito.domain.push.dto.FcmChatPayload;
import com.ssafy.ttomanito.domain.push.service.FcmService;
import com.ssafy.ttomanito.domain.push.service.PushTokenService;
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
import java.util.Objects;

@Slf4j
@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {
    private final ChattingService service;
    private final SimpMessagingTemplate template;
    private final PushTokenService pushTokenService;
    private final FcmService fcmService;

    /**
     * 1) 클라이언트에서 과거 메시지 요청 시
     * send → /app/chat.history.{chatRoomId}
     * payload → { "before": "2025-08-07T12:34:56.789" } or { "before": null }
     * receive → /user/queue/history
     */
    @MessageMapping("/chat.history.{chatRoomId}")
    public void history(
            @DestinationVariable Long chatRoomId,
            @Payload HistoryRequest req,
            Principal principal
    ) {
        log.info("[웹소켓] 채팅 히스토리 요청 - 방ID={}, 기준시간='{}', 사용자={}",
                chatRoomId, req.before(), principal != null ? principal.getName() : "익명");
        LocalDateTime before = null;
        if (req.before() != null && !req.before().isBlank()) {
            before = LocalDateTime.parse(req.before());
        }

        List<ChatMessageDto> history = service.getHistory(chatRoomId, before);
        log.debug("[웹소켓] 채팅 히스토리 응답 - 방ID={}, 메시지개수={}", chatRoomId, history.size());

        template.convertAndSendToUser(
                Objects.requireNonNull(principal).getName(),
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
        log.info("[웹소켓] 채팅 전송 요청 - 방ID={}, 발신자={}, 메시지길이={}",
                chatRoomId, payload.senderRoomUserId(),
                payload.content() == null ? 0 : payload.content().length());

        ChatMessageDto saved = service.sendText(chatRoomId, payload.senderRoomUserId(), payload.content());

        log.debug("[웹소켓] 채팅 전송 완료 - 방ID={}, 전송시각={}", chatRoomId, saved.sentAt());
        chatPush(chatRoomId, payload, saved);
    }

    /**
     * 3) 찌르기 요청 시
     * send → /app/chat.poke.{chatRoomId}
     * broadcast → /topic/chat.{chatRoomId}
     */
    @MessageMapping("/chat.poke.{chatRoomId}")
    public void poke(@DestinationVariable Long chatRoomId,
                     @Payload ChatMessageDto payload) {
        log.info("[웹소켓] 콕 찌르기 - 방ID={}, 발신자={}", chatRoomId, payload.senderRoomUserId());
        ChatMessageDto saved = service.sendPoke(chatRoomId, payload.senderRoomUserId());
        chatPush(chatRoomId, payload, saved);
    }

    private void chatPush(@DestinationVariable Long chatRoomId, @Payload ChatMessageDto payload, ChatMessageDto saved) {
        template.convertAndSend("/topic/chat." + chatRoomId, saved);

        List<Long> receiverUserIds = service.findReceivers(chatRoomId, payload.senderRoomUserId());
        List<String> tokens = pushTokenService.findTokensByUserIds(receiverUserIds);
        fcmService.sendMulticastMessage(tokens, new FcmChatPayload(
                "새 메시지", saved.content(), "https://i13b206.p.ssafy.io/chat/" + chatRoomId
        ));
    }
}
