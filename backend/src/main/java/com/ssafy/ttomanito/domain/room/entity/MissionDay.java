package com.ssafy.ttomanito.domain.room.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "mission_day")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
public class MissionDay {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "mission_day_id")
    private Long id;

    @Column(name = "room_id", nullable = false)
    private Long roomId;

    @Enumerated(EnumType.STRING)
    @Column(name = "day", nullable = false, length = 10)
    private Weekday day;

    public static MissionDay of(Long roomId, Weekday day) {
        return MissionDay.builder()
                .roomId(roomId)
                .day(day)
                .build();
    }

    /*
     * 추후 Room 엔티티와 연관관계 설정 시:
     *
     * @ManyToOne(fetch = FetchType.LAZY)
     * @JoinColumn(name = "room_id", insertable = false, updatable = false)
     * private Room room;
     */
}
