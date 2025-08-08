package com.ssafy.ttomanito.domain.chatting.user.entity;

import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@NoArgsConstructor
@EqualsAndHashCode
public class ChattingUserId implements Serializable {
    private Long chattingRoom;
    private Long roomUser;
}
