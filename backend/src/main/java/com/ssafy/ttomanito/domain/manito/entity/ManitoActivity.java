package com.ssafy.ttomanito.domain.manito.entity;

import com.ssafy.ttomanito.domain.room.entity.RoomUser;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "manito_activity")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder(toBuilder = true)
public class ManitoActivity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long activityId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "room_user_id", nullable = false)
    private RoomUser roomUser;

    @Column(nullable = false)
    private long callTime;               // 발신 통화 시간 (초)

    @Column(nullable = false)
    private int chatCount;               // 채팅 보낸 횟수

    @Column(nullable = false)
    private int missionSuccessCount;     // 미션 수행 횟수
}
