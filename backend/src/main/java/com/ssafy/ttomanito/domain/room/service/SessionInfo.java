package com.ssafy.ttomanito.domain.room.service;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class SessionInfo {
    private final String sessionId;
    private final Long roomId;
    private final Long userId;
}
