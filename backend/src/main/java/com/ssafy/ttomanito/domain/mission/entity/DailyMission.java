package com.ssafy.ttomanito.domain.mission.entity;

import com.ssafy.ttomanito.domain.room.entity.Room;
import com.ssafy.ttomanito.domain.room.entity.RoomUser;
import com.ssafy.ttomanito.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "daily_mission")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
@EntityListeners(AuditingEntityListener.class)
public class DailyMission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "daily_mission_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manito_id", nullable = false)
    private User manito;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mission_id", nullable = false)
    private Mission mission;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @Column(name = "mission_date", nullable = false)
    private LocalDate missionDate;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
    public DailyMission(User manito, Room room,Mission mission, LocalDate missionDate) {
        this.manito = manito;
        this.room =room;
        this.mission = mission;
        this.missionDate = missionDate;
    }
}
