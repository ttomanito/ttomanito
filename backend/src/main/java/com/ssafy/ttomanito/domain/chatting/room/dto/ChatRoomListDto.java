package com.ssafy.ttomanito.domain.chatting.room.dto;

import com.ssafy.ttomanito.domain.chatting.user.dto.ChatRoomWithUserDto;

public record ChatRoomListDto(
        ChatRoomWithUserDto manito,
        ChatRoomWithUserDto manitee
) {}