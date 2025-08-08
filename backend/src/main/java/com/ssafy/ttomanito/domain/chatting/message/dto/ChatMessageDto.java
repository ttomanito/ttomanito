package com.ssafy.ttomanito.domain.chatting.message.dto;

import java.time.LocalDateTime;

public record ChatMessageDto(
        Long chattingRoomId,
        Long senderRoomUserId,
        String content,
        LocalDateTime sentAt
) {
}
