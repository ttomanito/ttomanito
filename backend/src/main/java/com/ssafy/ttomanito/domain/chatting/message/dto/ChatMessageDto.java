package com.ssafy.ttomanito.domain.chatting.message.dto;

import java.time.LocalDateTime;

public record ChatMessageDto(
        Long chattingRoomId,
        Long senderRoomUserId,
        Long senderUserId,
        String content,
        MessageType type,
        LocalDateTime sentAt
) {
}
