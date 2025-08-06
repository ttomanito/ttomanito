package com.ssafy.ttomanito.domain.chatting.voice.entity;

import java.io.Serializable;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@EqualsAndHashCode
public class VoiceChatId implements Serializable {
    private static final long serialVersionUID = 1L;
    private Long chattingRoom;
    private Long roomUser;
}

