package com.ssafy.ttomanito.domain.room.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "mission_day")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder(toBuilder = true)
public class MissionDay {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "mission_day_id")
    private Long missionDayId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @Enumerated(EnumType.STRING)
    @Column(name = "day", nullable = false, length = 10)
    private Weekday day;

    // 정적 팩토리: Room 객체와 Weekday로 생성
    public static MissionDay of(Room room, Weekday day) {
        return MissionDay.builder()
                .room(room)
                .day(day)
                .build();
    }
}
