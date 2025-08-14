package com.ssafy.ttomanito.domain.chatting.voice.dto;

public class TokenResponse {
    private String token;
    private String sessionId;
    private String fullTokenUrl;

    public TokenResponse(String token, String sessionId, String fullTokenUrl) {
        this.token = token;
        this.sessionId = sessionId;
        this.fullTokenUrl = fullTokenUrl;
    }

    public String getToken() {
        return token;
    }

    public String getSessionId() {
        return sessionId;
    }

    public String getFullTokenUrl() {
        return fullTokenUrl;
    }
}