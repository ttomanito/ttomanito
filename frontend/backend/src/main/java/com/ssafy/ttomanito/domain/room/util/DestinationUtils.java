package com.ssafy.ttomanito.domain.room.util;

public final class DestinationUtils {

    private DestinationUtils() {
    }

    // 예) /topic/room/123  -> 123L
    public static Long extractRoomIdAsLong(String destination) {
        if (destination == null) throw new IllegalArgumentException("destination is null");
        String[] parts = destination.split("/");
        if (parts.length < 4) throw new IllegalArgumentException("invalid destination: " + destination);
        return Long.valueOf(parts[3]);
    }
}
