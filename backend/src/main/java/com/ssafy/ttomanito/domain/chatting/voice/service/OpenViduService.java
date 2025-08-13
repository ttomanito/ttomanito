package com.ssafy.ttomanito.domain.chatting.voice.service;

import io.openvidu.java.client.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

@Slf4j
@Service
public class OpenViduService {

    private final OpenVidu openVidu;

    public OpenViduService(
            @Value("${openvidu.url}") String url,
            @Value("${openvidu.secret}") String secret
    ) {
        String normalized = (url == null ? "" : url).trim().replaceAll("/+$", "");
        this.openVidu = new OpenVidu(normalized, secret);

        log.info("[OV] baseUrl='{}'", normalized);
        log.info("[OV] secret(hash)={}", Integer.toHexString(secret.hashCode()));
    }

    /** 세션 생성 (이미 있으면 409 → fetch → 기존 세션 반환) */
    public Session getOrCreateSession(String customSessionId)
            throws OpenViduJavaClientException, OpenViduHttpException {

        if (customSessionId == null || customSessionId.isBlank()) {
            throw new IllegalArgumentException("sessionId must not be null or blank");
        }
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
                openVidu.fetch(); // (원래 코드 유지)
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

    /** 토큰 생성 (URL 제거하고 순수 토큰만 반환) */
    public String generateConnectionToken(Session session, String data)
            throws OpenViduJavaClientException, OpenViduHttpException {

        if (session == null) {
            throw new IllegalArgumentException("session must not be null");
        }

        ConnectionProperties conn = new ConnectionProperties.Builder()
                .data(data == null ? "" : data)
                .build();

        String fullToken = session.createConnection(conn).getToken(); // e.g. wss://.../?sessionId=...&token=tok_xxx
        log.info("[OV] createConnection OK tokenLen={}", fullToken != null ? fullToken.length() : 0);

        return extractPureToken(fullToken); // "tok_xxx"만 반환
    }

    /** wss URL에서 token= 파라미터만 안전하게 추출 */
    private String extractPureToken(String fullToken) {
        if (fullToken == null || fullToken.isBlank()) {
            throw new IllegalStateException("OpenVidu returned empty token");
        }
        // 1) 표준: URI로 파싱 후 query에서 token 찾기
        try {
            URI uri = URI.create(fullToken);
            String query = uri.getQuery(); // e.g. "sessionId=1&token=tok_XXXXX"
            if (query != null) {
                for (String part : query.split("&")) {
                    int eq = part.indexOf('=');
                    if (eq > 0) {
                        String key = part.substring(0, eq);
                        String val = part.substring(eq + 1);
                        if ("token".equals(key)) {
                            return URLDecoder.decode(val, StandardCharsets.UTF_8);
                        }
                    }
                }
            }
        } catch (IllegalArgumentException ignore) {
            // 아래 폴백 사용
        }
        // 2) 폴백: 문자열에서 token= 뒤 값만 슬라이스 (뒤에 다른 파라미터가 있으면 & 전까지)
        int idx = fullToken.indexOf("token=");
        if (idx >= 0) {
            String val = fullToken.substring(idx + "token=".length());
            int amp = val.indexOf('&');
            if (amp >= 0) val = val.substring(amp + 0, amp); // & 전까지만
            return URLDecoder.decode(val, StandardCharsets.UTF_8);
        }
        throw new IllegalStateException("Malformed OpenVidu token format: 'token=' not found");
    }
}
