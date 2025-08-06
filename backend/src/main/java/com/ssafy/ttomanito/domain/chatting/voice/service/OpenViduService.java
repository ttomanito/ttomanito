package com.ssafy.ttomanito.domain.chatting.voice.service;

import io.openvidu.java.client.ConnectionProperties;
import io.openvidu.java.client.OpenVidu;
import io.openvidu.java.client.OpenViduJavaClientException;
import io.openvidu.java.client.OpenViduHttpException;
import io.openvidu.java.client.Session;
import io.openvidu.java.client.SessionProperties;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Map;

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
     * customSessionId로 세션 생성 시도. 이미 존재하면 HTTP 409 에러를 받아
     * 기존 세션을 fetch()로 가져옵니다.
     */
    public Session getOrCreateSession(String customSessionId)
            throws OpenViduJavaClientException, OpenViduHttpException {
        try {
            return openVidu.createSession(
                    SessionProperties.fromJson(Map.of("customSessionId", customSessionId)).build()
            );
        } catch (OpenViduHttpException e) {
            if (e.getStatus() == 409) {
                // 이미 생성된 세션이 있을 때는 기존 세션 반환
                openVidu.fetch();  // 🔄 fetches up-to-date list :contentReference[oaicite:2]{index=2}
                return openVidu.getActiveSession(customSessionId);
            }
            throw e;
        }
    }

    /**
     * 주어진 세션에 대해 Connection(token)을 생성합니다.
     * @param session 기존 또는 새로 생성된 OpenVidu 세션
     * @param data    클라이언트에 전달할 메타데이터(예: nickname)
     * @return 발급된 connection token
     */
    public String generateConnectionToken(Session session, String data)
            throws OpenViduJavaClientException, OpenViduHttpException {
        return session.createConnection(
                ConnectionProperties.fromJson(Map.of("data", data)).build()
        ).getToken();
    }
}
