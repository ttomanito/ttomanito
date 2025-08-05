package com.ssafy.ttomanito.domain.chatting.voice.entity;

import java.io.Serializable;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@EqualsAndHashCode
public class VoiceChatId implements Serializable {
    private Long chattingRoom;
    private Long roomUser;
}

