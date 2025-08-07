package com.ssafy.ttomanito.domain.report.entity;

public enum Genre {
    CALL_TIME, CHAT_COUNT, MISSION_SUCCESS, POKE;

    public static Genre of(int id) {
        return switch (id) {
            case 1 -> CALL_TIME;
            case 2 -> CHAT_COUNT;
            case 3 -> MISSION_SUCCESS;
            case 4 -> POKE;
            default -> throw new IllegalArgumentException("Unknown genreId=" + id);
        };
    }
}
