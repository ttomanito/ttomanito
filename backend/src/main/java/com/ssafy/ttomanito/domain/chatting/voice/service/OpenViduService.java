package com.ssafy.ttomanito.domain.chatting.voice.service;

import io.openvidu.java.client.ConnectionProperties;
import io.openvidu.java.client.OpenVidu;
import io.openvidu.java.client.OpenViduHttpException;
import io.openvidu.java.client.OpenViduJavaClientException;
import io.openvidu.java.client.Session;
import io.openvidu.java.client.SessionProperties;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

@Service
public class OpenViduService {

    private final OpenVidu openVidu;

    public OpenViduService(
            @Value("${openvidu.url}") String url,
            @Value("${openvidu.secret}") String secret
    ) {
        this.openVidu = new OpenVidu(url, secret);
    }

    /**
     * customSessionId로 세션 생성. 이미 존재(409)하면 fetch 후 기존 세션 반환.
     */
    public Session getOrCreateSession(String customSessionId)
            throws OpenViduJavaClientException, OpenViduHttpException {

        SessionProperties props = new SessionProperties.Builder()
                .customSessionId(customSessionId)
                .build();

        try {
            return openVidu.createSession(props);
        } catch (OpenViduHttpException e) {
            if (e.getStatus() == 409) {
                openVidu.fetch();
                for (Session s : openVidu.getActiveSessions()) {
                    if (customSessionId.equals(s.getSessionId())
                            || (s.getProperties() != null
                            && customSessionId.equals(s.getProperties().customSessionId()))) {
                        return s;
                    }
                }
            }
            throw e;
        }
    }

    /**
     * 커넥션 생성 후 OpenVidu '토큰 문자열'만 추출해서 반환.
     * (예: tok_xxxxxxxxxxxxxxxxx)
     */
    public String generateConnectionToken(Session session, String data)
            throws OpenViduJavaClientException, OpenViduHttpException {

        ConnectionProperties conn = new ConnectionProperties.Builder()
                .data(data == null ? "" : data)
                .build();

        // OpenVidu가 주는 rawToken은 wss 풀 URL 형태
        // 예: wss://.../openvidu?sessionId=room-123&token=tok_xxx&...
        String rawTokenUrl = session.createConnection(conn).getToken();

        URI uri = URI.create(rawTokenUrl);
        String token = getQueryParam(uri, "token");
        if (token == null || token.isBlank()) {
            throw new IllegalStateException("OpenVidu token not found in returned URL: " + rawTokenUrl);
        }
        return token;
    }

    private static String getQueryParam(URI uri, String key) {
        String query = uri.getQuery();
        if (query == null) return null;
        for (String pair : query.split("&")) {
            int idx = pair.indexOf('=');
            if (idx <= 0) continue;
            String k = URLDecoder.decode(pair.substring(0, idx), StandardCharsets.UTF_8);
            if (!key.equals(k)) continue;
            return URLDecoder.decode(pair.substring(idx + 1), StandardCharsets.UTF_8);
        }
        return null;

    }
}
