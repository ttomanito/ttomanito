package com.ssafy.ttomanito.domain.chatting.voice.dto;

public class TokenResponse {
    private String token;
    private String sessionId;


    public TokenResponse(String token, String sessionId) {
        this.token = token;
        this.sessionId = sessionId;

    }

    public String getToken() {
        return token;
    }

    public String getSessionId() {
        return sessionId;
    }
}
