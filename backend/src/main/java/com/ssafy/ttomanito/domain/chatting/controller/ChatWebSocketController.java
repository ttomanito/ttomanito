package com.ssafy.ttomanito.domain.chatting.controller;

import com.ssafy.ttomanito.domain.chatting.message.dto.ChatMessageDto;
import com.ssafy.ttomanito.domain.chatting.message.dto.HistoryRequest;
import com.ssafy.ttomanito.domain.chatting.message.dto.SocketPayload;
import com.ssafy.ttomanito.domain.chatting.service.ChattingService;
import com.ssafy.ttomanito.domain.push.dto.FcmChatPayload;
import com.ssafy.ttomanito.domain.push.service.FcmService;
import com.ssafy.ttomanito.domain.push.service.PushTokenService;
import com.ssafy.ttomanito.global.security.userdetails.JwtUserDetails;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.user.SimpSubscription;
import org.springframework.messaging.simp.user.SimpUser;
import org.springframework.messaging.simp.user.SimpUserRegistry;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.util.UriComponentsBuilder;

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
    private final SimpUserRegistry userRegistry;

    @Value("${url.redirect.base}")
    private String redirectBase;

    private String chatLink(Long chatRoomId) {
        return UriComponentsBuilder.fromUriString(redirectBase)
                .pathSegment("chat", chatRoomId.toString())
                .toUriString();
    }

    // === HISTORY (개인 큐) ===
    @MessageMapping("/chat.history.{chatRoomId}")
    public void history(@DestinationVariable Long chatRoomId,
                        @Payload HistoryRequest req,
                        Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof JwtUserDetails jud)) {
            log.warn("[WS] 인증 없음 - history room={}", chatRoomId);
            return;
        }
        Long userId = jud.getUserId();
        if (!service.isUserInChatRoom(chatRoomId, userId)) {
            log.warn("[WS] 히스토리 접근 거부 - room={}, user={}", chatRoomId, userId);
            return;
        }
        LocalDateTime before = (req.before() == null || req.before().isBlank())
                ? null : LocalDateTime.parse(req.before());

        var history = service.getHistory(chatRoomId, before);
        template.convertAndSendToUser(
                userId.toString(),
                "/queue/chat." + chatRoomId,
                new SocketPayload<>("HISTORY", history)
        );
    }

    @MessageMapping("/chat.send.{chatRoomId}")
    public void sendMessage(@DestinationVariable Long chatRoomId,
                            @Payload ChatMessageDto payload,
                            Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof JwtUserDetails jud)) {
            log.warn("[WS] 인증 없음 - history room={}", chatRoomId);
            return;
        }
        Long userId = jud.getUserId();
        if (!service.isUserInChatRoom(chatRoomId, userId)) return;
        service.assertOwner(payload.senderRoomUserId(), userId);

        ChatMessageDto saved = service.sendText(chatRoomId, payload.senderRoomUserId(), payload.content());
        pushToParticipants(chatRoomId, payload.senderRoomUserId(), saved);
        chatPushText(chatRoomId, payload.senderRoomUserId(), saved);
    }

    @MessageMapping("/chat.poke.{chatRoomId}")
    public void poke(@DestinationVariable Long chatRoomId,
                     @Payload ChatMessageDto payload,
                     Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof JwtUserDetails jud)) {
            log.warn("[WS] 인증 없음 - history room={}", chatRoomId);
            return;
        }
        Long userId = jud.getUserId();
        if (!service.isUserInChatRoom(chatRoomId, userId)) return;
        service.assertOwner(payload.senderRoomUserId(), userId);

        ChatMessageDto saved = service.sendPoke(chatRoomId, payload.senderRoomUserId());
        pushToParticipants(chatRoomId, payload.senderRoomUserId(), saved);
        chatPushBody(chatRoomId, payload.senderRoomUserId(), saved,
                "콕 찌르기", saved.content() != null ? saved.content() : "콕 찌르기가 도착했어요 👈");
    }

    @MessageMapping("/chat.call.start.{chatRoomId}")
    public void callStart(@DestinationVariable Long chatRoomId,
                          @Payload ChatMessageDto payload,
                          Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof JwtUserDetails jud)) {
            log.warn("[WS] 인증 없음 - history room={}", chatRoomId);
            return;
        }
        Long userId = jud.getUserId();
        if (!service.isUserInChatRoom(chatRoomId, userId)) return;
        service.assertOwner(payload.senderRoomUserId(), userId);

        ChatMessageDto saved = service.callStart(chatRoomId, payload.senderRoomUserId());
        pushToParticipants(chatRoomId, payload.senderRoomUserId(), saved);
        chatPushBody(chatRoomId, payload.senderRoomUserId(), saved, "통화 요청", "통화 요청이 도착했어요 📞");
    }

    @MessageMapping("/chat.call.accept.{chatRoomId}")
    public void callAccept(@DestinationVariable Long chatRoomId,
                           @Payload ChatMessageDto payload,
                           Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof JwtUserDetails jud)) {
            log.warn("[WS] 인증 없음 - history room={}", chatRoomId);
            return;
        }
        Long userId = jud.getUserId();
        if (!service.isUserInChatRoom(chatRoomId, userId)) return;
        service.assertOwner(payload.senderRoomUserId(), userId);

        ChatMessageDto saved = service.callAccept(chatRoomId, payload.senderRoomUserId());
        pushToParticipants(chatRoomId, payload.senderRoomUserId(), saved);
        chatPushBody(chatRoomId, payload.senderRoomUserId(), saved, "통화 수락", "상대가 통화를 수락했어요 ✅");
    }

    @MessageMapping("/chat.call.reject.{chatRoomId}")
    public void callReject(@DestinationVariable Long chatRoomId,
                           @Payload ChatMessageDto payload,
                           Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof JwtUserDetails jud)) {
            log.warn("[WS] 인증 없음 - history room={}", chatRoomId);
            return;
        }
        Long userId = jud.getUserId();
        if (!service.isUserInChatRoom(chatRoomId, userId)) return;
        service.assertOwner(payload.senderRoomUserId(), userId);

        ChatMessageDto saved = service.callReject(chatRoomId, payload.senderRoomUserId());
        pushToParticipants(chatRoomId, payload.senderRoomUserId(), saved);
        chatPushBody(chatRoomId, payload.senderRoomUserId(), saved, "통화 거절", "상대가 통화를 거절했어요 ❌");
    }

    // ===== 공통 유틸: 두 참여자에게만 개인 큐로 전송 =====
    private void pushToParticipants(Long chatRoomId, Long senderRoomUserId, ChatMessageDto saved) {
        // 상대방들
        List<Long> receiverUserIds = service.findReceivers(chatRoomId, senderRoomUserId);
        for (Long uid : receiverUserIds) {
            template.convertAndSendToUser(uid.toString(),
                    "/queue/chat." + chatRoomId,
                    new SocketPayload<>("MESSAGE", saved));
            if (isInRoom(uid, chatRoomId)) {
                try {
                    service.markRead(chatRoomId, uid);
                } catch (Exception e) {
                    log.warn("[WS] markRead 실패 room={}, user={}", chatRoomId, uid, e);
                }
            }
        }

        // 보낸 사람(에코)
        template.convertAndSendToUser(saved.senderUserId().toString(),
                "/queue/chat." + chatRoomId,
                new SocketPayload<>("MESSAGE", saved));

    }

    /** 텍스트 메시지: content를 그대로 사용 */
    private void chatPushText(Long chatRoomId, Long senderRoomUserId, ChatMessageDto saved) {
        // 방 브로드캐스트는 그대로
        template.convertAndSend("/topic/chat." + chatRoomId, saved);

        // 👇 수신자 목록과 참가자 역할 정보
        List<Long> receiverUserIds = service.findReceivers(chatRoomId, senderRoomUserId);
        var participants = service.participants(chatRoomId);

        for (Long uid : receiverUserIds) {
            String title = uid.equals(participants.manitoUserId()) ? "마니띠" : "마니또";
            List<String> tokens = pushTokenService.findTokensByUserIds(List.of(uid));
            if (tokens != null && !tokens.isEmpty()) {
                fcmService.sendMulticastMessage(tokens, new FcmChatPayload(
                        title,
                        saved.content() != null ? saved.content() : "메시지가 도착했어요",
                        chatLink(chatRoomId)
                ));
            }
        }
    }

    /** 이벤트 메시지(POKE/CALL_*): 보기 좋은 바디로 전달 */
    private void chatPushBody(Long chatRoomId, Long senderRoomUserId, ChatMessageDto saved,
                              String title, String body) {
        template.convertAndSend("/topic/chat." + chatRoomId, saved);

        List<Long> receiverUserIds = service.findReceivers(chatRoomId, senderRoomUserId);
        List<String> tokens = pushTokenService.findTokensByUserIds(receiverUserIds);

        fcmService.sendMulticastMessage(tokens, new FcmChatPayload(
                title, body, chatLink(chatRoomId)
        ));
    }

    private boolean isInRoom(Long userId, Long chatRoomId) {
        SimpUser user = userRegistry.getUser(userId.toString());
        if (user == null) return false;

        String userQueueDest = "/user/queue/chat." + chatRoomId; // 개인큐 구독
        String topicDest     = "/topic/chat." + chatRoomId;      // 방 브로드캐스트 구독
        String directQueue   = "/queue/chat." + chatRoomId;      // 혹시 직접 큐를 구독한 경우 대비

        return user.getSessions().stream()
                .flatMap(s -> s.getSubscriptions().stream())
                .map(SimpSubscription::getDestination)
                .filter(Objects::nonNull)
                .anyMatch(dest ->
                        dest.equals(userQueueDest) ||
                                dest.equals(topicDest)     ||
                                dest.equals(directQueue)
                );
    }
}
