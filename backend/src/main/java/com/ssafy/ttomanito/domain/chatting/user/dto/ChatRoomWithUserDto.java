package com.ssafy.ttomanito.domain.chatting.user.dto;

import com.ssafy.ttomanito.domain.chatting.room.dto.ChattingRoomDto;

public record ChatRoomWithUserDto(
        ChattingRoomDto chatRoom,       // chatting_room 테이블 정보
        ChattingUserDto chatUserInfo    // chatting_user 테이블 정보
) {
}
