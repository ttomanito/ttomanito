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
        LocalDateTime now = LocalDateTime.now();
        this.endedAt = now;

        // 1) 이번 세션의 지속시간 계산
        int diff = (int) Duration.between(startedAt, now).getSeconds();

        // 2) 기존 durationSec에 누적
        int prev = (this.durationSec == null ? 0 : this.durationSec);
        this.durationSec = prev + diff;

        // 3) 비활성화
        this.isActive = false;
    }
    public void cancel() {
        this.startedAt = null;
        this.endedAt   = null;
        this.isActive = false;

    }
    public void activate() {
        LocalDateTime now = LocalDateTime.now();
        this.startedAt = now;
        this.isActive = true;
    }
}
