package com.ssafy.ttomanito.domain.chatting.entity;

import com.ssafy.ttomanito.domain.room.entity.RoomUser;
import jakarta.persistence.*;
import lombok.*;

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
}
