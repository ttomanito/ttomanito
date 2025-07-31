package com.ssafy.ttomanito.domain.room.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "room")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder(toBuilder = true)
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "room_id")
    private Long id;

    @Column(name = "creator_id", nullable = false)
    private Long creatorId;

    @Column(nullable = false, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RoomStatus status;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    // 정적 팩토리 메서드
    public static Room create(Long creatorId, String name) {
        return Room.builder()
                .creatorId(creatorId)
                .name(name)
                .status(RoomStatus.NOT_STARTED)
                .build();
    }
    // Room.java 내부에 추가
    public void markAsNone() {
        this.status = RoomStatus.NONE;
    }
    // 게임 시작
    public void start(LocalDate when) {
        this.status = RoomStatus.IN_PROGRESS;
        this.startDate = when;
        this.endDate = null;
    }

    // 게임 종료
    public void finish(LocalDate when) {
        this.status = RoomStatus.FINISHED;
        this.endDate = when;
    }
}
