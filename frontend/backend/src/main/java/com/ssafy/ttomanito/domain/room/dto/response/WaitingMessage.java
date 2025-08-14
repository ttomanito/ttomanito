package com.ssafy.ttomanito.domain.room.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class WaitingMessage {

    private Long roomId;
    private Long userId;
    private String statusMessage;
    private MessageType type;

    public enum MessageType {
        ENTER, EXIT, CLOSE, START, KICK
    }
}
