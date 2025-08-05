package com.ssafy.ttomanito.signal;

public record SignalMessage(
        String type,
        Long senderId,
        Long receiverId,   // 추가
        String sdp,
        String candidate
) {}
