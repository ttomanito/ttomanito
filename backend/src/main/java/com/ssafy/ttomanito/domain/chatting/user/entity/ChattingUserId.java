package com.ssafy.ttomanito.domain.chatting.user.entity;

import java.io.Serializable;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@EqualsAndHashCode
public class ChattingUserId implements Serializable {
    private Long chattingRoom;
    private Long roomUser;
}
