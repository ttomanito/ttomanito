package com.ssafy.ttomanito.domain.chatting.room.dto;

import java.time.LocalDateTime;

public record ChattingRoomDto(
        Long chattingRoomId,
        Long manitoAssignmentId,
        String lastMessage,
        LocalDateTime lastMessageTime
) {}