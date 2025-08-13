package com.ssafy.ttomanito.domain.chatting.voice.service;

import io.openvidu.java.client.ConnectionProperties;
import io.openvidu.java.client.OpenVidu;
import io.openvidu.java.client.OpenViduHttpException;
import io.openvidu.java.client.OpenViduJavaClientException;
import io.openvidu.java.client.Session;
import io.openvidu.java.client.SessionProperties;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

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
                // sessionId 혹은 properties.customSessionId 둘 다 체크
                for (Session s : openVidu.getActiveSessions()) {
                    if (customSessionId.equals(s.getSessionId())
                            || (s.getProperties() != null
                            && customSessionId.equals(s.getProperties().customSessionId()))) {
                        return s;
                    }
                }
                // 못 찾으면 원래 예외 던짐
            }
            throw e;
        }
    }

    /**
     * 커넥션 생성 후 '풀 URL 토큰' 그대로 반환 (wss://...&token=tok_xxx).
     */
    public String generateConnectionToken(Session session, String data)
            throws OpenViduJavaClientException, OpenViduHttpException {

        ConnectionProperties conn = new ConnectionProperties.Builder()
                .data(data == null ? "" : data)
                .build();

        return session.createConnection(conn).getToken();
    }
}
