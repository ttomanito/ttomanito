package com.ssafy.ttomanito.domain.manito.entity;

import com.ssafy.ttomanito.domain.room.entity.Room;
import com.ssafy.ttomanito.domain.room.entity.RoomUser;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "manito_assignment")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder(toBuilder = true)
public class ManitoAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "manito_assignment_id")
    private Long manitoAssignmentId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "manito_id", nullable = false)
    private RoomUser manito;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "manitee_id", nullable = false)
    private RoomUser manitee;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    /**
     * 정적 팩토리 메서드
     */
    public static ManitoAssignment create(RoomUser manito, RoomUser manitee, Room room) {
        return ManitoAssignment.builder()
                .manito(manito)
                .manitee(manitee)
                .room(room)
                .build();
    }
}
