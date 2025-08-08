package com.ssafy.ttomanito.domain.chatting.user.dto;

import java.time.LocalDateTime;

public record ChattingUserDto(
        Long chattingRoomId,
        Long roomUserId,
        Integer unreadCount,
        LocalDateTime lastReadTime
) {
}