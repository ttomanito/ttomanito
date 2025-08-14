package com.ssafy.ttomanito.domain.rank.entity;

public enum RankingGenre {
    VOICE_CALL(1, "음성통화 시간"),
    CHAT_COUNT(2, "채팅 보낸 횟수"),
    MISSION_COUNT(3, "미션 수행 횟수");

    private final int code;
    private final String description;

    RankingGenre(int code, String description) {
        this.code = code;
        this.description = description;
    }

    public int getCode() {
        return code;
    }

    public static RankingGenre fromCode(int code) {
        for (RankingGenre g : values()) {
            if (g.code == code) return g;
        }
        throw new IllegalArgumentException("Unknown genre code: " + code);
    }
}
