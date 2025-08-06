package com.ssafy.ttomanito.domain.chatting.voice.dto;

public record CallSignalDto(
        String type,
        Long chatroomId,
        Long callerId,
        String callerNickname
) {}
