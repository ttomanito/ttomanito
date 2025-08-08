package com.ssafy.ttomanito.domain.room.dto.response;

public record WaitingEventMessage(Long roomId, Long userId, WaitingMessage.MessageType type) {};