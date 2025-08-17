package com.ssafy.ttomanito.domain.push.service;

import com.google.firebase.ErrorCode;
import com.google.firebase.messaging.*;
import com.ssafy.ttomanito.domain.push.dto.FcmChatPayload;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

//import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class FcmService {

    private final PushTokenService pushTokenService;

    /** 토큰 최대 500개/요청 → 자동 분할 */
    public void sendMulticastMessage(List<String> tokens, FcmChatPayload chat) {
        if (tokens == null || tokens.isEmpty()) return;

        final int BATCH = 500;
        for (int i = 0; i < tokens.size(); i += BATCH) {
            List<String> part = tokens.subList(i, Math.min(i + BATCH, tokens.size()));
            sendOneBatch(part, chat);
        }
    }

    private void sendOneBatch(List<String> tokens, FcmChatPayload chat) {
        WebpushNotification webpushNotification = WebpushNotification.builder()
                .setTitle(chat.title())
                .setBody(chat.body())
                .build();

        WebpushFcmOptions webpushFcmOptions = WebpushFcmOptions.builder()
                .setLink(chat.link())
                .build();

        WebpushConfig webpushConfig = WebpushConfig.builder()
                .setNotification(webpushNotification)
                .setFcmOptions(webpushFcmOptions)
                .build();

        MulticastMessage msg = MulticastMessage.builder()
                .putData("link", chat.link())
//                .putData("sentAt", LocalDateTime.now().toString())
                .setWebpushConfig(webpushConfig)
                .addAllTokens(tokens)
                .build();

        try {
            BatchResponse res = FirebaseMessaging.getInstance().sendEachForMulticast(msg);

            if (res.getFailureCount() > 0) {
                log.warn("FCM partial failure: success={}, failure={}",
                        res.getSuccessCount(), res.getFailureCount());

                for (int i = 0; i < res.getResponses().size(); i++) {
                    SendResponse r = res.getResponses().get(i);
                    if (!r.isSuccessful()) {
                        String badToken = tokens.get(i);

                        FirebaseMessagingException ex = r.getException();
                        ErrorCode code = (ex != null) ? ex.getErrorCode() : null;

                        // 영구 오류만 정리: INVALID_ARGUMENT, NOT_FOUND(=기존 UNREGISTERED에 해당)
                        if (code == ErrorCode.INVALID_ARGUMENT || code == ErrorCode.NOT_FOUND) {
                            log.info("Disable invalid FCM token: {}, code={}", badToken, code);
                            pushTokenService.invalidate(badToken);  // soft disable
                        } else {
                            log.warn("Transient FCM error: token={}, code={}", badToken, code);
                        }
                    }
                }
            }
        } catch (FirebaseMessagingException e) {
            log.warn("FCM send error", e);
        }
    }
}
