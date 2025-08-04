package com.ssafy.ttomanito.domain.mission.entity;

import com.ssafy.ttomanito.domain.room.entity.RoomUser;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "mission_status")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
@EntityListeners(AuditingEntityListener.class)
public class MissionStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "mission_status_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_user_id", nullable = false)
    private RoomUser roomUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "daily_mission_id", nullable = false)
    private DailyMission dailyMission;

    @Column(name = "completed", nullable = false)
    private boolean completed;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public MissionStatus(RoomUser roomUser, DailyMission newDailyMission, boolean b) {
        this.roomUser = roomUser;
        this.dailyMission = newDailyMission;
        this.completed = b;
    }

    // 도메인 메서드
    public void complete() {
        this.completed = true;
        this.completedAt = LocalDateTime.now();
    }
}
