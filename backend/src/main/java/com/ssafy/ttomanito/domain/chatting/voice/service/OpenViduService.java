package com.ssafy.ttomanito.domain.chatting.voice.service;

import io.openvidu.java.client.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class OpenViduService {

    private final OpenVidu openVidu;

    public OpenViduService(
            @Value("${openvidu.url}") String url,
            @Value("${openvidu.secret}") String secret
    ) {
        // URL 공백 제거 및 끝 슬래시 제거
        String normalized = (url == null ? "" : url).trim().replaceAll("/+$", "");
        // http/https 스킴은 그대로 유지 (2.20.0은 강제 변환 안 함)
        this.openVidu = new OpenVidu(normalized, secret);

        log.info("[OV] baseUrl='{}'", normalized);
        log.info("[OV] secret(hash)={}", Integer.toHexString(secret.hashCode())); // 비밀키 직접 노출 X
    }

    /** 세션 생성 (이미 있으면 409 → fetch → 기존 세션 반환) */
    public Session getOrCreateSession(String customSessionId)
            throws OpenViduJavaClientException, OpenViduHttpException {

        if (customSessionId == null || customSessionId.isBlank()) {
            throw new IllegalArgumentException("sessionId must not be null or blank");
        }

        // sessionId 형식 재검증 (영문 숫자 - _ 만 허용)
        if (!customSessionId.matches("^[a-zA-Z0-9_-]+$")) {
            throw new IllegalArgumentException("Invalid sessionId format");
        }

        SessionProperties props = new SessionProperties.Builder()
                .customSessionId(customSessionId)
                .build();

        try {
            Session session = openVidu.createSession(props);
            log.info("[OV] createSession OK id='{}'", session.getSessionId());
            return session;

        } catch (OpenViduHttpException e) {
            log.warn("[OV] createSession EX status={} msg={}", e.getStatus(), e.getMessage());

            if (e.getStatus() == 409) {
                openVidu.fetch(); // 세션 목록 갱신
                openVidu.fetch(); // 최신 세션 목록 동기화
                Session existing = openVidu.getActiveSessions().stream()
                        .filter(s -> customSessionId.equals(s.getSessionId())
                                || (s.getProperties() != null && customSessionId.equals(s.getProperties().customSessionId())))
                        .findFirst()
                        .orElse(null);
                if (existing != null) {
                    log.info("[OV] existing session id='{}'", existing.getSessionId());
                    return existing;
                }
            }
            throw e;
        }
    }
    

    /** 토큰 생성 */
    public String generateConnectionToken(Session session, String data)
            throws OpenViduJavaClientException, OpenViduHttpException {

        if (session == null) {
            throw new IllegalArgumentException("session must not be null");
        }

        ConnectionProperties conn = new ConnectionProperties.Builder()
                .data(data == null ? "" : data)
                .build();

        String token = session.createConnection(conn).getToken();
        log.info("[OV] createConnection OK tokenLen={}", token != null ? token.length() : 0);
        return token;
    }
}
