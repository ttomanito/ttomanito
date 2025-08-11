package com.ssafy.ttomanito.domain.push.service;

import com.google.firebase.messaging.*;
import com.ssafy.ttomanito.domain.push.dto.FcmChatPayload;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class FcmService {

    public void sendMulticastMessage(List<String> tokens, FcmChatPayload chat) {
        if (tokens == null || tokens.isEmpty()) return;

        MulticastMessage msg = MulticastMessage.builder()
                .putData("link", chat.link()) // SW에서 딥링크로 사용
                .setWebpushConfig(WebpushConfig.builder()
                        .setNotification(new WebpushNotification(chat.title(), chat.body()))
                        .setFcmOptions(WebpushFcmOptions.withLink(chat.link()))
                        .build())
                .addAllTokens(tokens)
                .build();

        try {
            BatchResponse res = FirebaseMessaging.getInstance().sendMulticast(msg);
            if (res.getFailureCount() > 0) {
                // 죽은 토큰 정리(선택 구현: PushTokenService.invalidate)
                log.warn("FCM partial failure: success={}, failure={}", res.getSuccessCount(), res.getFailureCount());
            }
        } catch (FirebaseMessagingException e) {
            log.warn("FCM send error", e);
        }
    }
}
