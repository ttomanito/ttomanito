package com.ssafy.ttomanito.domain.chatting.message.dto;

public enum MessageType {
    TEXT,          // 일반 채팅
    POKE,          // 콕 찌르기
    CALL_START,    // 통화 시작
    CALL_ACCEPT,   // 통화 수락 
    CALL_REJECT    // 통화 거절
}