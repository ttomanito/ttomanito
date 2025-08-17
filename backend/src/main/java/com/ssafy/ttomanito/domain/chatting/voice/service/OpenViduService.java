package com.ssafy.ttomanito.domain.chatting.voice.service;

import io.openvidu.java.client.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class OpenViduService {

    private final OpenVidu openVidu;

    public OpenViduService(
            @Value("${openvidu.url}") String url,
            //openvidu.url=https://localhost:4443
            @Value("${openvidu.secret}") String secret
    ) {
        this.openVidu = new OpenVidu(url, secret);
    }

    /**
     * customSessionId로 세션 생성. 이미 존재(409)하면 기존 세션 반환.
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
                    if (customSessionId.equals(s.getSessionId()) ||
                            (s.getProperties() != null &&
                                    customSessionId.equals(s.getProperties().customSessionId()))) {
                        return s;
                    }
                }
            }
            throw e;
        }
    }

    /**
     * 세션에 새로운 연결 생성 후 "토큰 문자열"만 반환
     * 예: tok_xxxxxxxxxxxxxx
     */
    public String generateConnectionToken(Session session, String data)
            throws OpenViduJavaClientException, OpenViduHttpException {

        ConnectionProperties conn = new ConnectionProperties.Builder()
                .data(data == null ? "" : data)
                .build();

        Connection connection = session.createConnection(conn);

        System.out.println("[DEBUG] connection.getToken(): " + connection.getToken());
        // 여기서 getToken() 하면 tok_... 만 나옴
        return connection.getToken();
    }
}
