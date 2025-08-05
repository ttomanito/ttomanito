package com.ssafy.ttomanito.domain.chatting.voice.entity;

import com.ssafy.ttomanito.domain.chatting.room.entity.ChattingRoom;
import com.ssafy.ttomanito.domain.room.entity.RoomUser;
import jakarta.persistence.*;
import lombok.*;

import java.time.Duration;
import java.time.LocalDateTime;

@Entity
@Table(name = "voice_chat")
@IdClass(VoiceChatId.class)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder(toBuilder = true)
public class VoiceChat {

    @Id
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "chatting_room_id", nullable = false)
    private ChattingRoom chattingRoom;

    @Id
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "room_user_id", nullable = false)
    private RoomUser roomUser;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "ended_at")
    private LocalDateTime endedAt;

    @Column(name = "duration_sec")
    private Integer durationSec;

    @Column(name = "is_active", nullable = false)
    private boolean isActive;
    /* ── 정적 팩토리 ───────────────────────── */
    public static VoiceChat start(ChattingRoom room, RoomUser user) {
        return VoiceChat.builder()
                .chattingRoom(room)
                .roomUser(user)
                .startedAt(LocalDateTime.now())
                .isActive(true) // ✅ 추가
                .build();
    }

    /* ── 비즈니스 메서드 ───────────────────── */
    public void endNow() {
        this.endedAt     = LocalDateTime.now();
        this.durationSec = (int) Duration.between(startedAt, endedAt).getSeconds();
        this.isActive    = false; // ✅ 종료 처리
    }

    public void activate(LocalDateTime startedAt) {
        this.startedAt = startedAt;
        this.isActive = true;
    }
}
