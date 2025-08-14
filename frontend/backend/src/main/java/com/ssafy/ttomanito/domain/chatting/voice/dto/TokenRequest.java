package com.ssafy.ttomanito.domain.chatting.voice.dto;

public record TokenRequest(
        String sessionId,
        String nickname
) {
}