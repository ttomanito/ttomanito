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

    @MessageMapping("/chat.history.{chatRoomId}")
    public void history(
            @DestinationVariable Long chatRoomId,
            @Payload HistoryRequest req,
            Principal principal
    ) {
        log.info("[웹소켓] 채팅 히스토리 요청 - 채팅방ID={}, 기준시간='{}', 사용자={}",
                chatRoomId, req.before(), principal != null ? principal.getName() : "익명");
        LocalDateTime before = null;
        if (req.before() != null && !req.before().isBlank()) {
            before = LocalDateTime.parse(req.before());
        }

        List<ChatMessageDto> history = service.getHistory(chatRoomId, before);
        log.debug("[웹소켓] 채팅 히스토리 응답 - 채팅방ID={}, 메시지개수={}", chatRoomId, history.size());

        template.convertAndSendToUser(
                Objects.requireNonNull(principal).getName(),
                "/queue/history",
                history
        );
    }

    @MessageMapping("/chat.send.{chatRoomId}")
    public void sendMessage(@DestinationVariable Long chatRoomId,
                            @Payload ChatMessageDto payload) {
        log.info("[웹소켓] 채팅 전송 요청 - 채팅방ID={}, 발신자={}, 메시지길이={}",
                chatRoomId, payload.senderRoomUserId(),
                payload.content() == null ? 0 : payload.content().length());

        ChatMessageDto saved = service.sendText(chatRoomId, payload.senderRoomUserId(), payload.content());
        log.debug("[웹소켓] 채팅 전송 완료 - 채팅방ID={}, 전송시각={}", chatRoomId, saved.sentAt());

        // 텍스트는 본문 그대로 푸시
        chatPushText(chatRoomId, payload.senderRoomUserId(), saved);
    }

    @MessageMapping("/chat.poke.{chatRoomId}")
    public void poke(@DestinationVariable Long chatRoomId,
                     @Payload ChatMessageDto payload) {
        log.info("[웹소켓] 콕 찌르기 - 채팅방ID={}, 발신자={}", chatRoomId, payload.senderRoomUserId());
        ChatMessageDto saved = service.sendPoke(chatRoomId, payload.senderRoomUserId());

        // 콕 찌르기 푸시
        chatPushBody(chatRoomId, payload.senderRoomUserId(), saved,
                "콕 찌르기", saved.content() != null ? saved.content() : "콕 찌르기가 도착했어요 👈");
    }

    // ✅ 통화 시작
    @MessageMapping("/chat.call.start.{chatRoomId}")
    public void callStart(@DestinationVariable Long chatRoomId,
                          @Payload ChatMessageDto payload) {
        log.info("[웹소켓] 통화 요청 - 채팅방ID={}, 발신자={}", chatRoomId, payload.senderRoomUserId());
        ChatMessageDto saved = service.callStart(chatRoomId, payload.senderRoomUserId());

        chatPushBody(chatRoomId, payload.senderRoomUserId(), saved,
                "통화 요청", "통화 요청이 도착했어요 📞");
    }

    // ✅ 통화 수락
    @MessageMapping("/chat.call.accept.{chatRoomId}")
    public void callAccept(@DestinationVariable Long chatRoomId,
                           @Payload ChatMessageDto payload) {
        log.info("[웹소켓] 통화 수락 - 채팅방ID={}, 발신자={}", chatRoomId, payload.senderRoomUserId());
        ChatMessageDto saved = service.callAccept(chatRoomId, payload.senderRoomUserId());

        chatPushBody(chatRoomId, payload.senderRoomUserId(), saved,
                "통화 수락", "상대가 통화를 수락했어요 ✅");
    }

    // ✅ 통화 거절
    @MessageMapping("/chat.call.reject.{chatRoomId}")
    public void callReject(@DestinationVariable Long chatRoomId,
                           @Payload ChatMessageDto payload) {
        log.info("[웹소켓] 통화 거절 - 채팅방ID={}, 발신자={}", chatRoomId, payload.senderRoomUserId());
        ChatMessageDto saved = service.callReject(chatRoomId, payload.senderRoomUserId());

        chatPushBody(chatRoomId, payload.senderRoomUserId(), saved,
                "통화 거절", "상대가 통화를 거절했어요 ❌");
    }

    /** 텍스트 메시지: content를 그대로 사용 */
    private void chatPushText(Long chatRoomId, Long senderRoomUserId, ChatMessageDto saved) {
        template.convertAndSend("/topic/chat." + chatRoomId, saved);

        List<Long> receiverUserIds = service.findReceivers(chatRoomId, senderRoomUserId);
        List<String> tokens = pushTokenService.findTokensByUserIds(receiverUserIds);

        fcmService.sendMulticastMessage(tokens, new FcmChatPayload(
                "새 메시지", saved.content(), "https://i13b206.p.ssafy.io/chat/" + chatRoomId
        ));
    }

    /** 이벤트 메시지(POKE/CALL_*): 보기 좋은 바디로 전달 */
    private void chatPushBody(Long chatRoomId, Long senderRoomUserId, ChatMessageDto saved,
                              String title, String body) {
        template.convertAndSend("/topic/chat." + chatRoomId, saved);

        List<Long> receiverUserIds = service.findReceivers(chatRoomId, senderRoomUserId);
        List<String> tokens = pushTokenService.findTokensByUserIds(receiverUserIds);

        fcmService.sendMulticastMessage(tokens, new FcmChatPayload(
                title, body, "https://i13b206.p.ssafy.io/chat/" + chatRoomId
        ));
    }
}
